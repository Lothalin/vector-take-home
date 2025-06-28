import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { WebScraper } from './scraper.js';
import { HtmlParser } from './parser.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, '../')));

app.get('/', (_, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

app.get('/health', (_, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.post('/api/scrape', async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'URL is required. Please provide a URL to scrape.',
        timestamp: new Date().toISOString()
      });
    }
    
    const scraper = new WebScraper();
    const parser = new HtmlParser();
    const html = await scraper.fetchPage(url);
    const parsedContent = await parser.parse(html, url);
    
    res.json(parsedContent.devices);
  } catch (error) {
    console.error('Scrape failed:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

app.get('/static-data', (_, res) => {
  const staticHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <product>
        <name>Sample Cardiac Device - Test Product</name>
        <description>This is a test cardiac device for demonstration purposes.</description>
        <models>A123, B456, C789</models>
        <type>Pacemaker</type>
      </product>
      <product>
        <name>Second Cardiac Device - Test Product</name>
        <description>This is the second test cardiac device for demonstration purposes.</description>
        <models>A234, B567, C890</models>
        <type>ICM</type>
      </product>
    </head>
    </html>
  `;
  
  res.setHeader('Content-Type', 'text/html');
  res.send(staticHtml);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});
