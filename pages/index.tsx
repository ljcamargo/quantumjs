import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import styles from './index.module.css';

export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout description="A fluent DSL and OpenQASM compiler for JavaScript and TypeScript">
      <main className={styles.main}>
        <div className={styles.hero}>
          <h1 className={styles.title}>QuantumJS</h1>
          <p className={styles.tagline}>
            A fluent DSL and AST-driven OpenQASM compiler<br/>for JavaScript and TypeScript
          </p>
          <div className={styles.buttons}>
            <Link className="button button--primary button--lg" to="/">
              Get Started
            </Link>
            <Link className="button button--secondary button--lg" href="https://quantumjs.netlify.app">
              Live Demo
            </Link>
          </div>
          <pre className={styles.snippet}>{`import { circuit } from 'quantumjs';

const c = circuit({ qubits: 2 }, Q => {
  Q.bit(0).h();
  Q.bit(0).cx(Q.bit(1));
  Q.all().measure();
});

console.log(c.compile()); // OpenQASM 3.0`}</pre>
        </div>
      </main>
    </Layout>
  );
}
