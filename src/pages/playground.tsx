import React, { useState, useRef, useEffect } from 'react';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import BujjiCode from '@site/src/components/BujjiCode';
import styles from './playground.module.css';

interface Preset {
  name: string;
  code: string;
  description: string;
}

const PRESETS: Preset[] = [
  {
    name: 'Hello World',
    code: `user = "Anand" bujji\n"namaskaram $user" anicheppu`,
    description: 'A simple program that greets the user.',
  },
  {
    name: 'Conditionals & Grades ',
    code: `marks = 72 bujji\n\nmarks >= 35 ithe:\n    "pass ayyavu" anicheppu\nleda:\n    "malli try cheyyi" anicheppu`,
    description: 'Check if marks are passing or failing using conditional blocks.',
  },
  {
    name: 'Custom Function',
    code: `idhi a, b addition:\n    a + b pampi\n\nsum = 10, 20 addition bujji\n"sum is $sum" anicheppu`,
    description: 'Define a function to add two numbers and output the sum.',
  },
  {
    name: 'Loop Counter',
    code: `counter = 1 bujji\n\ncounter <= 5 ithe:\n    "counter value is $counter" anicheppu\n    counter = counter + 1 bujji\n    malli`,
    description: 'Iterate and output numbers 1 to 5 using a loop block.',
  },
];

export default function BujjiPlayground() {
  const [code, setCode] = useState<string>(PRESETS[0].code);
  const [output, setOutput] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [apiUrl, setApiUrl] = useState<string>('https://anandpasupuleti-bujji-api.hf.space/execute');
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [execDuration, setExecDuration] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);

  // Sync scrolling between textarea, highlighted BujjiCode code element, and line gutter
  const handleScroll = () => {
    if (textareaRef.current) {
      const { scrollTop, scrollLeft } = textareaRef.current;

      if (highlightRef.current) {
        highlightRef.current.scrollTop = scrollTop;
        highlightRef.current.scrollLeft = scrollLeft;
      }

      if (gutterRef.current) {
        gutterRef.current.scrollTop = scrollTop;
      }
    }
  };

  // Sync scroll position whenever code changes to handle cursor edits
  useEffect(() => {
    handleScroll();
  }, [code]);

  // Handle Tab indentation and Ctrl/Cmd + Enter submission
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleRun();
      return;
    }

    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const value = textarea.value;
      const newValue = value.substring(0, start) + '    ' + value.substring(end);

      setCode(newValue);

      // Restore cursor position after DOM updates
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 4;
      }, 0);
    }
  };

  // Run code against execution server
  const handleRun = async () => {
    if (!code.trim()) return;

    setStatus('loading');
    setError(null);
    setOutput(null);
    setExecDuration(null);

    const startTime = performance.now();

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });

      const duration = ((performance.now() - startTime) / 1000).toFixed(2);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Server returned status ${response.status}: ${errorText || response.statusText}`
        );
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();

        if (data.error) {
          setStatus('error');
          setError(data.error);
          setOutput(data.output || '');
        } else {
          setStatus('success');
          setOutput(data.output || '');
        }
      } else {
        // Fallback to plain text output
        const text = await response.text();
        setStatus('success');
        setOutput(text);
      }

      setExecDuration(duration);
    } catch (err: any) {
      const duration = ((performance.now() - startTime) / 1000).toFixed(2);
      setStatus('error');

      // Provide actionable feedback for connection failures
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        setError(
          `CORS or connection failure: Failed to connect to execution server at ${apiUrl}.\n\n` +
          `1. Ensure your Bujji Lang runner backend is running.\n` +
          `2. Check that the port matches and CORS headers are configured in your backend.\n` +
          `3. If running over HTTPS with self-signed certs, open ${apiUrl} in a browser tab to trust the certificate.`
        );
      } else {
        setError(err.message || 'An unknown network error occurred.');
      }
      setExecDuration(duration);
    }
  };

  const handleClear = () => {
    setCode('');
    if (textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.scrollTop = 0;
      textareaRef.current.scrollLeft = 0;
    }
    if (highlightRef.current) {
      highlightRef.current.scrollTop = 0;
      highlightRef.current.scrollLeft = 0;
    }
    if (gutterRef.current) {
      gutterRef.current.scrollTop = 0;
    }
  };

  const handlePresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedPresetIndex = parseInt(e.target.value, 10);
    if (!isNaN(selectedPresetIndex) && PRESETS[selectedPresetIndex]) {
      const presetCode = PRESETS[selectedPresetIndex].code;
      setCode(presetCode);

      // Sync focus, select preset code, and reset scroll offsets
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(0, presetCode.length);
          textareaRef.current.scrollTop = 0;
          textareaRef.current.scrollLeft = 0;
        }
        if (highlightRef.current) {
          highlightRef.current.scrollTop = 0;
          highlightRef.current.scrollLeft = 0;
        }
        if (gutterRef.current) {
          gutterRef.current.scrollTop = 0;
        }
      }, 50);
    }
  };

  const linesCount = code.split('\n').length;
  const lineNumbers = Array.from({ length: Math.max(linesCount, 1) }, (_, i) => i + 1);

  return (
    <Layout
      title="Bujji Lang Online Playground"
      description="Run and practice Bujji Lang online. An interactive, syntax-highlighted coding playground for programming in Telugu grammar."
    >
      <main className={styles.playgroundContainer}>
        <header className={styles.header}>
          <div className={styles.titleSection}>
            <div>
              <Heading as="h1" id="playground-title">
                Bujji Lang Playground
              </Heading>
            </div>
            {/* <button
              onClick={() => setShowSettings(!showSettings)}
              className={styles.settingsToggleBtn}
              id="settings-toggle-btn"
              aria-label="Toggle Server Settings"
            >
              ⚙️ Server Config
            </button> */}
          </div>
          <p className={styles.subtitle}>
            Write your Bujji Lang programs in the code editor, select custom templates, and execute
            them using the local code execution runner.
          </p>
        </header>

        {showSettings && (
          <section className={styles.settingsPanel} aria-label="API Settings Panel">
            <label htmlFor="settings-api-url">Execution API Endpoint URL:</label>
            <input
              id="settings-api-url"
              type="text"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              placeholder="https://localhost:3000/execute"
            />
            <small style={{ color: 'var(--bujji-muted)', marginTop: '0.2rem' }}>
              Modify this to point to your local or remote code compiler backend (e.g. <code>http://localhost:3000/execute</code>).
            </small>
          </section>
        )}

        <section className={styles.controlBar} aria-label="Editor Controls">
          <div className={styles.controlsLeft}>
            <label htmlFor="preset-selector" style={{ display: 'none' }}>
              Select a sample program
            </label>
            <select
              id="preset-selector"
              onChange={handlePresetChange}
              className={styles.selectPreset}
              defaultValue="0"
            >
              {PRESETS.map((preset, index) => (
                <option key={index} value={index}>
                  {preset.name}
                </option>
              ))}
            </select>
            <button
              onClick={handleClear}
              className={styles.btnSecondary}
              id="clear-code-btn"
            >
              Clear Editor
            </button>
          </div>
          <div className={styles.controlsRight}>
            <button
              onClick={handleRun}
              disabled={status === 'loading'}
              className={styles.btnPrimary}
              id="run-code-btn"
            >
              {status === 'loading' ? (
                <>⏳ Running...</>
              ) : (
                <>▶ Run Code <kbd style={{ marginLeft: '4px', fontSize: '0.75rem', background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff' }}>Ctrl+Enter</kbd></>
              )}
            </button>
          </div>
        </section>

        <div className={styles.workspaceGrid}>
          {/* Editor Container */}
          <div className={styles.panelCard}>
            <div className={styles.panelHeader}>
              <span className={styles.panelTitle}>📝 main.bj</span>
              <span className={styles.panelMeta}>
                {linesCount} lines | {code.length} chars
              </span>
            </div>

            <div className={styles.editorScrollContainer}>
              {/* Line Numbers Gutter */}
              <div className={styles.lineNumbersGutter} ref={gutterRef} aria-hidden="true">
                {lineNumbers.map((num) => (
                  <span key={num} className={styles.lineNumber}>
                    {num}
                  </span>
                ))}
              </div>

              {/* Underlying Syntax Highlighting */}
              <div className={styles.editorHighlight} ref={highlightRef}>
                <BujjiCode code={code} noTrim={true} />
              </div>

              {/* Overlay Interactive Textarea */}
              <textarea
                ref={textareaRef}
                id="editor-textarea"
                className={styles.editorTextarea}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onScroll={handleScroll}
                onKeyDown={handleKeyDown}
                placeholder="Write your Bujji code here..."
                spellCheck="false"
                autoCapitalize="off"
                autoComplete="off"
                autoCorrect="off"
              />
            </div>
          </div>

          {/* Output Window */}
          <div className={styles.panelCard}>
            <div className={styles.terminalContainer}>
              <div className={styles.terminalHeader}>
                <div className={styles.macButtons}>
                  <div className={`${styles.macDot} ${styles.macDotClose}`} />
                  <div className={`${styles.macDot} ${styles.macDotMinimize}`} />
                  <div className={`${styles.macDot} ${styles.macDotMaximize}`} />
                </div>
                <span className={styles.terminalName}>Terminal Output</span>
                <div>
                  <button
                    onClick={() => {
                      setOutput(null);
                      setError(null);
                      setStatus('idle');
                      setExecDuration(null);
                    }}
                    className={styles.btnSecondary}
                    style={{
                      padding: '0.15rem 0.5rem',
                      fontSize: '0.75rem',
                      borderColor: '#444',
                      color: '#bbb',
                    }}
                    id="clear-output-btn"
                  >
                    Clear Output
                  </button>
                </div>
              </div>

              <div className={styles.terminalContent}>
                {status === 'idle' && (
                  <div className={styles.terminalIdle}>
                    <div className={styles.terminalIdleIcon}>🐚</div>
                    <div>
                      <strong>Bujji Lang Terminal</strong>
                      <p style={{ fontSize: '0.8rem', color: '#666', margin: '0.25rem 0 0 0' }}>
                        Click &quot;Run Code&quot; to compile and execute program.
                      </p>
                    </div>
                  </div>
                )}

                {status === 'loading' && (
                  <div className={styles.terminalRunning}>
                    <div className={styles.pulseDot} />
                    <span>Executing code on runner...</span>
                  </div>
                )}

                {(output !== null || error !== null) && (
                  <>
                    {output && (
                      <div className={`${styles.terminalRow} ${styles.stdout}`}>
                        {output}
                      </div>
                    )}

                    {error && (
                      <div className={`${styles.terminalRow} ${styles.stderr}`}>
                        <strong>Runtime/Network Error:</strong>
                        <pre style={{ background: 'transparent', border: 'none', padding: 0, color: 'inherit', margin: '0.5rem 0 0 0', whiteSpace: 'pre-wrap' }}>
                          {error}
                        </pre>
                      </div>
                    )}

                    <div className={styles.metaInfo}>
                      <span>
                        Status:{' '}
                        <span
                          className={`${styles.badge} ${status === 'success' ? styles.badgeSuccess : styles.badgeError
                            }`}
                        >
                          {status}
                        </span>
                      </span>
                      {execDuration && <span>Time: {execDuration}s</span>}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
}