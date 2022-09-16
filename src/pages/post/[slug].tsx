import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router'
import { useState } from 'react';
import { FaCalendar, FaClock, FaUser } from 'react-icons/fa';
import Header from '../../components/Header';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  uid: string;
  data: {
    title: string;
    subtitle: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({post}: PostProps) {
  const router = useRouter()
  function getTimeToRead(){
    return Math.ceil(Number(JSON.stringify(post.data.content).split(" ").length / 200))
  }
  if (post) {
    return (
      <main className={styles.contentContainer}>
          {router.isFallback ? <p>Carregando...</p> : <></>}
          <Header></Header>
          <img className={styles.banner} src={post?.data?.banner?.url} alt="" />
          <section className={styles.post}>
            <h1 className={styles.title}>{post?.data?.title}</h1>
            <section className={styles.postInfo}>
              <p><FaCalendar size="0.75rem" style={{marginRight: '0.5rem'}}/>
              {format(new Date(post.first_publication_date), 'dd MMM yyyy', {
                locale: ptBR,
              })}
              </p>
              <p><FaUser size="0.75rem" style={{marginRight: '0.5rem'}}/>
                {post?.data?.author}
              </p>
              <p><FaClock size="0.75rem" style={{marginRight: '0.5rem'}}/>
                {getTimeToRead()} min
              </p>
              
            </section>
            <div>
              {
                post?.data?.content?.map(
                  (content, index) => (
                    <div className={styles.postContent} key={index}>
                      <small className={styles.heading}>{(content.heading)}</small>
                      { content.body.map((body, index) => (
                        <div key={index}>
                          <p className={styles.body}>{body.text}</p>
                        </div>
                      ))}
                    </div>
                  )
                )
              }
            </div>
          </section>
          
        </main>
    )
  }else {
    return (<>
      Carregando...
    </>)
  }
}

export const getStaticPaths = async () => {
  const prismic = getPrismicClient({});
  const posts = await prismic.getByType("blog_post", {pageSize: 1, fetch: ['slug']});
  const paths = posts.results.map(post => ({
    params: { slug: post.uid },
  }));
  return {
    paths,
    fallback: true
  };
};

export const getStaticProps = async ({params }) => {
  const {slug} = params;
  const prismic = getPrismicClient({});
  const response = await prismic.getByUID("blog_post", String(slug));
  console.log("testeee", response)
  const post: Post = {
    first_publication_date: response.first_publication_date,
    uid: response.uid,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      content: response.data.content
    }
  };
  return {
    props: {
      post
    }
  }
};
