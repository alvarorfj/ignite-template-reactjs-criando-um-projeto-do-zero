import {FaCalendar, FaUser} from "react-icons/fa"
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import Head from 'next/head';
import { getPrismicClient } from '../services/prismic';
import styles from './home.module.scss';
import Link from 'next/link'
import { useState } from "react";

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({postsPagination}: HomeProps) {
    const [posts, setPosts] = useState(postsPagination);
    async function loadPosts(url: string): Promise<void> {
    const response = await fetch(`${url}`)
      .then(response => {
        if (response.status === 200) {
          return response.json();
        }
        throw response;
      }
    ).then(data => {
      console.log(data);
      var results: Post[] = [];
      data.results.map(post => {
        const newPost: Post = {
          uid: post.uid,
          first_publication_date: format(new Date(post.first_publication_date.substring(0, 10)), "dd MMM yyyy", {locale: ptBR}),
          data: {
            title: post.data.title,
            subtitle: post.data.subtitle,
            author: post.data.author,
          }
        };
        results.push(newPost);
      })
      const newPostPagination: PostPagination = {
        next_page: data.next_page,
        results: results
      }
      setPosts(newPostPagination)
    });
  }
  return (
    <>
      <Head>
        <title>spacetraveling</title>
      </Head>

      <main className={styles.contentContainer}>
        <section className={styles.header}>
          <img src="/logo.svg" alt="logo" />
        </section>
        <section className={styles.post}>

        { posts.results.map(post => (
          <Link href={`/post/${post.uid}`}> 
            <a key={post.uid} >
              <p className={styles.title}>{post.data.title}</p>
              <p className={styles.description}>{post.data.subtitle}</p>
              <div className={styles.postInfo}>
                <p><FaCalendar size="0.75rem" style={{marginRight: '0.5rem'}}/>
                {format(new Date(post.first_publication_date), 'dd MMM yyyy', {
                  locale: ptBR,
                })}
                </p>
                <p><FaUser size="0.75rem" style={{marginRight: '0.5rem'}}/>{post.data.author}</p>
              </div>
            </a>
          </Link>
        ))}
        </section>

        <section>
          {posts.next_page !== null ? 
            <p onClick={() => {loadPosts(posts.next_page)}} className={styles.loadMorePostsButton}>Carregar mais posts</p>
          : <></> }
        </section>
      </main>
      
    </>
  )
}

export const getStaticPaths = () => {
  return {
      paths: [],
      fallback: 'blocking'
  }
}



export const getStaticProps = async () => {
  const prismic = getPrismicClient({});
  var response = await prismic.getByType("blog_post", {pageSize: 1, fetch: ['slug', 'title', 'description', 'author', 'first_publication_date']});
  console.log(response)
  var results: Post[] = [];
  response.results?.map(post => {
    const newPost: Post = {
      uid: post.uid,
      first_publication_date: post.data.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      }
    };
    results.push(newPost);
  })
  const postsPagination: PostPagination = {
      next_page: response.next_page,
      results: results
  }
  return {
    props: {
      postsPagination
    }
  }
};


// return {
//   slug: post.uid,
//   title: post.data.title,
//   subtitle: post.data.subtitle,
//   author: post.data.author,
//   banner: post.data.banner.url,
//   bannerAlt: post.data.banner.alt,
//   content: post.data.content.map(content => {
//     return {
//       heading: content.heading,
//       body: RichText.asHtml(content.body)
//     }
//   }),
//   updateAt: new Date(post.first_publication_date).toLocaleDateString('pt-BR', {
//       day: '2-digit',
//       month: 'long',
//       year: 'numeric'
//   })
// };