interface BlogPost {
  id: string;
  title: string;
  author?: string | null;
  content: string;
  date: string;
  image?: {
    src: string;
    alt: string;
  };
  href: string;
}

export async function searchBlogPosts(query: string): Promise<BlogPost[]> {
  try {
    const response = await fetch(`/api/blog-posts?limit=20`);
    
    if (!response.ok) {
      return [];
    }
    
    const data = await response.json();
    
    if (data.status !== 'success' || !data.posts) {
      return [];
    }

    // Filter posts based on query
    const filteredPosts = data.posts.filter((post: BlogPost) =>
      post.title.toLowerCase().includes(query.toLowerCase())
    );

    return filteredPosts.slice(0, 10);
  } catch (error) {
    console.error('Error searching blog posts:', error);
    return [];
  }
} 