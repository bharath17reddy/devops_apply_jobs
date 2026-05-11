import fs from 'fs';
import path from 'path';
import { remark } from 'remark';
import html from 'remark-html';
import gfm from 'remark-gfm';

export default async function ProfilePage() {
  let cvHtml = '';
  try {
    const cvPath = path.join(process.cwd(), '..', 'cv.md');
    const cvContent = fs.readFileSync(cvPath, 'utf8');
    const processedContent = await remark()
      .use(gfm)
      .use(html)
      .process(cvContent);
    cvHtml = processedContent.toString();
  } catch (error) {
    cvHtml = '<p>No cv.md found in the root directory.</p>';
  }

  return (
    <div className="container">
      <header style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Professional Profile</h1>
        <p style={{ color: 'var(--muted)', fontSize: '1.1rem' }}>Live rendering of your career blueprint.</p>
      </header>

      <div className="glass" style={{ padding: '3rem', maxWidth: '900px', margin: '0 auto' }}>
        <div 
          className="markdown-content"
          dangerouslySetInnerHTML={{ __html: cvHtml }} 
        />
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .markdown-content h1 { font-size: 2rem; margin-bottom: 1.5rem; border-bottom: 2px solid var(--primary); padding-bottom: 0.5rem; }
        .markdown-content h2 { font-size: 1.5rem; margin-top: 2rem; margin-bottom: 1rem; color: var(--primary); }
        .markdown-content h3 { font-size: 1.2rem; margin-top: 1.5rem; }
        .markdown-content p { line-height: 1.6; margin-bottom: 1rem; color: var(--foreground); }
        .markdown-content ul { margin-bottom: 1.5rem; padding-left: 1.5rem; }
        .markdown-content li { margin-bottom: 0.5rem; line-height: 1.5; }
        .markdown-content strong { color: white; }
      `}} />
    </div>
  );
}
