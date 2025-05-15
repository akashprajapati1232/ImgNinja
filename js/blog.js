/**
 * Blog functionality for Image Compressor Pro
 */

document.addEventListener('DOMContentLoaded', function() {
  // Initialize blog filters
  initializeBlogFilters();
  
  // Initialize blog search
  initializeBlogSearch();
  
  // Initialize pagination
  initializePagination();
  
  // Initialize newsletter form
  initializeNewsletterForm();
});

/**
 * Initialize blog category filters
 */
function initializeBlogFilters() {
  const filterButtons = document.querySelectorAll('.category-filter');
  const blogPosts = document.querySelectorAll('.blog-card');
  
  // Check if we're on the blog listing page
  if (!filterButtons.length || !blogPosts.length) return;
  
  filterButtons.forEach(button => {
    button.addEventListener('click', function() {
      // Remove active class from all buttons
      filterButtons.forEach(btn => btn.classList.remove('active'));
      
      // Add active class to clicked button
      this.classList.add('active');
      
      const category = this.dataset.category;
      
      // Show/hide blog posts based on category
      blogPosts.forEach(post => {
        if (category === 'all' || post.dataset.category === category) {
          post.style.display = 'block';
          // Reset animation
          post.style.animation = 'none';
          setTimeout(() => {
            post.style.animation = 'fadeIn 0.5s ease forwards';
          }, 10);
        } else {
          post.style.display = 'none';
        }
      });
    });
  });
  
  // Check URL parameters for category filter
  const urlParams = new URLSearchParams(window.location.search);
  const categoryParam = urlParams.get('category');
  
  if (categoryParam) {
    const categoryButton = document.querySelector(`.category-filter[data-category="${categoryParam}"]`);
    if (categoryButton) {
      categoryButton.click();
    }
  }
  
  // Check URL parameters for tag filter
  const tagParam = urlParams.get('tag');
  
  if (tagParam) {
    filterPostsByTag(tagParam);
  }
}

/**
 * Filter posts by tag
 */
function filterPostsByTag(tag) {
  const blogPosts = document.querySelectorAll('.blog-card');
  const blogContainer = document.getElementById('blog-posts-container');
  
  if (!blogPosts.length || !blogContainer) return;
  
  // Add a heading for the tag filter
  const tagHeading = document.createElement('h2');
  tagHeading.className = 'tag-filter-heading';
  tagHeading.innerHTML = `Posts tagged with: <span class="highlight">${tag}</span> <a href="blog.html" class="clear-filter">(Clear filter)</a>`;
  
  // Insert the heading before the blog grid
  blogContainer.parentNode.insertBefore(tagHeading, blogContainer);
  
  // For a real implementation, you would fetch posts by tag from a database
  // This is a simplified version that just hides all posts for demonstration
  blogPosts.forEach(post => {
    // In a real implementation, you would check if the post has the tag
    // For now, we'll just show a subset of posts randomly
    if (Math.random() > 0.5) {
      post.style.display = 'block';
    } else {
      post.style.display = 'none';
    }
  });
}

/**
 * Initialize blog search functionality
 */
function initializeBlogSearch() {
  const searchInput = document.getElementById('blog-search');
  const searchButton = document.getElementById('search-button');
  const blogPosts = document.querySelectorAll('.blog-card');
  
  if (!searchInput || !searchButton || !blogPosts.length) return;
  
  const performSearch = () => {
    const searchTerm = searchInput.value.toLowerCase().trim();
    
    if (searchTerm === '') {
      // Reset all posts to visible
      blogPosts.forEach(post => {
        post.style.display = 'block';
      });
      return;
    }
    
    // Filter posts based on search term
    blogPosts.forEach(post => {
      const title = post.querySelector('h3').textContent.toLowerCase();
      const excerpt = post.querySelector('.blog-excerpt').textContent.toLowerCase();
      const category = post.querySelector('.blog-category').textContent.toLowerCase();
      
      if (title.includes(searchTerm) || excerpt.includes(searchTerm) || category.includes(searchTerm)) {
        post.style.display = 'block';
        // Reset animation
        post.style.animation = 'none';
        setTimeout(() => {
          post.style.animation = 'fadeIn 0.5s ease forwards';
        }, 10);
      } else {
        post.style.display = 'none';
      }
    });
    
    // Reset category filters
    document.querySelectorAll('.category-filter').forEach(btn => {
      btn.classList.remove('active');
    });
    document.querySelector('.category-filter[data-category="all"]').classList.add('active');
  };
  
  // Search on button click
  searchButton.addEventListener('click', performSearch);
  
  // Search on Enter key
  searchInput.addEventListener('keyup', function(e) {
    if (e.key === 'Enter') {
      performSearch();
    }
  });
}

/**
 * Initialize pagination
 */
function initializePagination() {
  const paginationButtons = document.querySelectorAll('.pagination-btn');
  
  if (!paginationButtons.length) return;
  
  paginationButtons.forEach(button => {
    button.addEventListener('click', function() {
      // In a real implementation, this would load the next page of posts
      // For now, we'll just update the active state
      
      if (this.classList.contains('next')) {
        // Find the currently active button
        const activeButton = document.querySelector('.pagination-btn.active');
        const nextButton = activeButton.nextElementSibling;
        
        if (nextButton && !nextButton.classList.contains('next')) {
          activeButton.classList.remove('active');
          nextButton.classList.add('active');
        }
      } else {
        paginationButtons.forEach(btn => {
          btn.classList.remove('active');
        });
        this.classList.add('active');
      }
      
      // Scroll to top of blog grid
      const blogGrid = document.querySelector('.blog-grid');
      if (blogGrid) {
        window.scrollTo({
          top: blogGrid.offsetTop - 100,
          behavior: 'smooth'
        });
      }
    });
  });
}

/**
 * Initialize newsletter form
 */
function initializeNewsletterForm() {
  const newsletterForm = document.querySelector('.newsletter-form');
  
  if (!newsletterForm) return;
  
  newsletterForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const emailInput = this.querySelector('input[type="email"]');
    const email = emailInput.value.trim();
    
    if (email === '') {
      alert('Please enter your email address.');
      return;
    }
    
    // In a real implementation, this would submit the form to a server
    // For now, we'll just show a success message
    
    const newsletterContent = document.querySelector('.newsletter-content');
    newsletterContent.innerHTML = `
      <h2>Thank you for subscribing!</h2>
      <p>You've successfully subscribed to our newsletter with the email address: <strong>${email}</strong></p>
      <p>You'll start receiving our latest image optimization tips and tutorials soon.</p>
    `;
  });
}

/**
 * Calculate reading time for blog posts
 */
function calculateReadingTime() {
  const blogContent = document.querySelector('.blog-content');
  const readingTimeElement = document.querySelector('.blog-reading-time');
  
  if (!blogContent || !readingTimeElement) return;
  
  const text = blogContent.textContent;
  const wordCount = text.split(/\s+/).length;
  const readingTime = Math.ceil(wordCount / 200); // Assuming 200 words per minute
  
  readingTimeElement.innerHTML = `<i class="far fa-clock"></i> ${readingTime} min read`;
}

/**
 * Add copy functionality to code blocks
 */
function initializeCodeBlocks() {
  const codeBlocks = document.querySelectorAll('pre code');
  
  if (!codeBlocks.length) return;
  
  codeBlocks.forEach(block => {
    const copyButton = document.createElement('button');
    copyButton.className = 'copy-code-button';
    copyButton.textContent = 'Copy';
    
    block.parentNode.insertBefore(copyButton, block);
    
    copyButton.addEventListener('click', function() {
      const code = block.textContent;
      navigator.clipboard.writeText(code).then(() => {
        copyButton.textContent = 'Copied!';
        setTimeout(() => {
          copyButton.textContent = 'Copy';
        }, 2000);
      });
    });
  });
}
