import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import BujjiCode from '@site/src/components/BujjiCode';

import styles from './index.module.css';

const heroCode = `user = "Anand" bujji
"namaskaram $user" anicheppu

marks = 72 bujji
marks >= 35 ithe:
    "pass ayyavu" anicheppu
leda:
    "malli try cheyyi" anicheppu`;

const features = [
  {
    title: 'Telugu grammar first',
    text: 'Bujji is not just English syntax with Telugu names. It tries to arrange code in a sentence flow that feels natural to Telugu learners.',
  },
  {
    title: 'Romanised Telugu keywords',
    text: 'Write keywords like bujji, ante, ithe, poni, leda, malli, aagu, chaalu, pampi, and anicheppu with normal English letters.',
  },
  {
    title: 'Beginner-friendly basics',
    text: 'Start with variables, arithmetic, indentation blocks, conditionals, and loops before moving into bigger programs.',
  },
];

function HomepageHeader() {
  return (
    <header className={styles.hero}>
      <div className={styles.heroInner}>
        <section className={styles.heroCopy}>
          <p className={styles.eyebrow}>Bujji Lang</p>
          <Heading as="h1">Programming that speaks closer to Telugu thought</Heading>
          <p className={styles.subtitle}>
            Bujji is a dynamically typed programming language for Telugu people,
            with romanised Telugu keywords and Python-style indentation blocks.
          </p>
          <div className={styles.actions}>
            <Link className="button button--primary button--lg" to="/docs/intro">
              Read the intro
            </Link>
            <Link className="button button--secondary button--lg" to="/docs/category/beginner-tutorial">
              Start learning
            </Link>
          </div>
        </section>
        <div className={styles.heroCode}>
          <BujjiCode code={heroCode} title="hello.bg" />
        </div>
      </div>
    </header>
  );
}

function FeatureGrid() {
  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <p className={styles.eyebrow}>Why Bujji</p>
        <Heading as="h2">A gentler first step into programming</Heading>
      </div>
      <div className={styles.featureGrid}>
        {features.map((feature) => (
          <article className={styles.featureCard} key={feature.title}>
            <Heading as="h3">{feature.title}</Heading>
            <p>{feature.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function LearningPath() {
  return (
    <section className={styles.learningBand}>
      <div className={styles.learningContent}>
        <div>
          <p className={styles.eyebrow}>Beginner Tutorial</p>
          <Heading as="h2">Learn the basics in small examples</Heading>
          <p>
            The tutorial starts from printing text and variables, then moves into
            arithmetic, indentation blocks, Telugu-style conditionals, and loops.
          </p>
        </div>
        <Link className="button button--primary button--lg" to="/docs/beginner-tutorial/first-program">
          Open first lesson
        </Link>
      </div>
    </section>
  );
}

export default function Home(): ReactNode {
  return (
    <Layout
      title="Bujji Lang"
      description="Bujji is a dynamically typed programming language shaped around Telugu grammar and romanised Telugu keywords.">
      <HomepageHeader />
      <main>
        <FeatureGrid />
        <LearningPath />
      </main>
    </Layout>
  );
}
