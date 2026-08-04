import { MeiliSearch } from 'meilisearch';
import Fuse from 'fuse.js';

export interface SearchItem {
  id: string;
  documentId: string;
  pageIndex: number;
  paragraphIndex: number;
  text: string;
}

export interface SearchResult {
  hits: SearchItem[];
  total: number;
}

export interface SearchAdapter {
  indexDocumentChunks(documentId: string, chunks: SearchItem[]): Promise<void>;
  search(query: string, documentId?: string): Promise<SearchResult>;
  deleteDocumentIndex(documentId: string): Promise<void>;
}

// 1. MeiliSearch Production Adapter
export class MeiliSearchAdapter implements SearchAdapter {
  private client: MeiliSearch;
  private indexName = 'document_chunks';

  constructor() {
    this.client = new MeiliSearch({
      host: process.env.MEILISEARCH_HOST || 'http://localhost:7700',
      apiKey: process.env.MEILISEARCH_API_KEY || '',
    });
  }

  async indexDocumentChunks(documentId: string, chunks: SearchItem[]): Promise<void> {
    const index = this.client.index(this.indexName);
    await index.addDocuments(chunks);
  }

  async search(query: string, documentId?: string): Promise<SearchResult> {
    const index = this.client.index(this.indexName);
    const filter = documentId ? `documentId = ${documentId}` : undefined;
    
    const searchResponse = await index.search(query, {
      filter,
      limit: 20
    });

    return {
      hits: searchResponse.hits as SearchItem[],
      total: searchResponse.totalHits || searchResponse.hits.length,
    };
  }

  async deleteDocumentIndex(documentId: string): Promise<void> {
    const index = this.client.index(this.indexName);
    await index.deleteDocuments({
      filter: `documentId = ${documentId}`
    });
  }
}

// 2. Fuse.js Local/Offline Fallback Adapter (runs on Electron / in-memory DB)
export class FuseSearchAdapter implements SearchAdapter {
  private localIndex: Map<string, SearchItem[]> = new Map();

  async indexDocumentChunks(documentId: string, chunks: SearchItem[]): Promise<void> {
    this.localIndex.set(documentId, chunks);
  }

  async search(query: string, documentId?: string): Promise<SearchResult> {
    let itemsToSearch: SearchItem[] = [];
    
    if (documentId) {
      itemsToSearch = this.localIndex.get(documentId) || [];
    } else {
      // Search all documents combined
      for (const docs of this.localIndex.values()) {
        itemsToSearch.push(...docs);
      }
    }

    if (itemsToSearch.length === 0) {
      return { hits: [], total: 0 };
    }

    const fuse = new Fuse(itemsToSearch, {
      keys: ['text'],
      threshold: 0.3,
      includeScore: true
    });

    const results = fuse.search(query);
    return {
      hits: results.map(r => r.item),
      total: results.length
    };
  }

  async deleteDocumentIndex(documentId: string): Promise<void> {
    this.localIndex.delete(documentId);
  }
}

export function getSearchAdapter(): SearchAdapter {
  if (process.env.MEILISEARCH_HOST && process.env.MEILISEARCH_API_KEY) {
    try {
      return new MeiliSearchAdapter();
    } catch (e) {
      console.warn('Meilisearch failed to initialize, falling back to local memory search', e);
    }
  }
  return new FuseSearchAdapter();
}
