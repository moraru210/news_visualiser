import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import ReactFlow from "react-flow-renderer";

export default function Home() {

  const elements = [
    {
      id: '1',
      type: 'input',
      data: { label: 'Input Node' },
      position: { x: 250, y: 25 },
    },
    // default node
    {
      id: '2',
      // you can also pass a React component as a label
      data: { label: <div>Default Node</div> },
      position: { x: 100, y: 125 },
    },
    {
      id: '3',
      type: 'output', // output node
      data: { label: 'Output Node' },
      position: { x: 250, y: 250 },
    },
    // animated edge
    // { id: 'e1-2', source: '1', target: '2', animated: true },
    { id: 'e2-3', source: '2', target: '3' },
  ];

  return (
    <div className={styles.container}>
      <Head>
        <title>News Visualiser</title>
        <meta name="description" content="An interactive visualisation of current and popular news stories" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <h1>News Visualiser</h1>
      <div style={{ height: 300 }}>
        <ReactFlow elements={elements} />
      </div>
    </div>
  )
}
