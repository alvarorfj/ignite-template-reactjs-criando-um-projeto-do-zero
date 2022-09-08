import {FaCalendar, FaUser} from "react-icons/fa"
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import Head from 'next/head';
import { getPrismicClient } from '../services/prismic';
import styles from './home.module.scss';
import Link from 'next/link'

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
  
  return (
    <>
      <Head>
        <title>Isso é um teste</title>
      </Head>

      <main className={styles.contentContainer}>
        <section className={styles.header}>
          <img src="/logo.svg" alt="logo" />
        </section>
        <section className={styles.post}>

        { postsPagination.results.map(post => (
          <Link href={`/posts/preview/${post.uid}`}> 
            <a key={post.uid} >
              <p className={styles.title}>{post.data.title}</p>
              <p className={styles.description}>{post.data.subtitle}</p>
              <div className={styles.postInfo}>
                <p><FaCalendar size="0.75rem" style={{marginRight: '0.5rem'}}/>
                  {post.first_publication_date}
                </p>
                <p><FaUser size="0.75rem" style={{marginRight: '0.5rem'}}/>{post.data.author}</p>
              </div>
            </a>
          </Link>
        ))}
        </section>

        <section>
          <p className={styles.loadMorePostsButton}>Carregar mais posts</p>
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
  const response = await prismic.getByType("blog_post", {pageSize: 1, fetch: ['slug', 'title', 'description', 'author', 'first_publication_date']});
  var results: Post[] = [];
  response.results?.map(post => {
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
  console.log(results)
  const postsPagination: PostPagination = {
      next_page: '0',
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