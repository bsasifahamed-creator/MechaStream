import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Layout, 
  ShoppingCart, 
  User, 
  BarChart3, 
  Calendar,
  FileText,
  Sparkles,
  Copy,
  Play,
  Star,
  Download
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: React.ComponentType<any>;
  code: string;
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  rating: number;
}

const templates: Template[] = [
  {
    id: 'dashboard',
    name: 'Analytics Dashboard',
    description: 'Modern dashboard with charts, metrics, and responsive design',
    category: 'Business',
    icon: BarChart3,
    difficulty: 'intermediate',
    rating: 4.8,
    tags: ['dashboard', 'analytics', 'charts', 'responsive'],
    code: `import React from 'react';

const Dashboard = () => {
  const [data, setData] = React.useState({
    users: 1234,
    revenue: 45678,
    orders: 89,
    growth: 12.5
  });

  return React.createElement('div', {
    style: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '2rem',
      fontFamily: 'Inter, sans-serif'
    }
  }, [
    React.createElement('div', {
      key: 'header',
      style: { textAlign: 'center', marginBottom: '3rem' }
    }, [
      React.createElement('h1', {
        key: 'title',
        style: {
          fontSize: '2.5rem',
          fontWeight: 'bold',
          color: 'white',
          marginBottom: '0.5rem'
        }
      }, 'Analytics Dashboard'),
      React.createElement('p', {
        key: 'subtitle',
        style: {
          color: 'rgba(255,255,255,0.8)',
          fontSize: '1.1rem'
        }
      }, 'Real-time metrics and insights')
    ]),
    React.createElement('div', {
      key: 'metrics',
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem'
      }
    }, [
      React.createElement('div', {
        key: 'users',
        style: {
          background: 'white',
          padding: '1.5rem',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }
      }, [
        React.createElement('h3', {
          key: 'metric-title',
          style: {
            fontSize: '1.2rem',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '0.5rem'
          }
        }, 'Total Users'),
        React.createElement('p', {
          key: 'metric-value',
          style: {
            fontSize: '2rem',
            fontWeight: 'bold',
            color: '#667eea'
          }
        }, data.users.toLocaleString())
      ])
    ])
  ]);
};

export default Dashboard;`
  },
  {
    id: 'ecommerce',
    name: 'E-commerce Store',
    description: 'Complete online store with product grid and shopping cart',
    category: 'Business',
    icon: ShoppingCart,
    difficulty: 'advanced',
    rating: 4.6,
    tags: ['ecommerce', 'shopping', 'products', 'cart'],
    code: `import React from 'react';

const EcommerceStore = () => {
  const [cart, setCart] = React.useState([]);
  const [products] = React.useState([
    { id: 1, name: 'Product 1', price: 29.99, image: 'https://via.placeholder.com/150' },
    { id: 2, name: 'Product 2', price: 39.99, image: 'https://via.placeholder.com/150' }
  ]);

  const addToCart = (product) => {
    setCart([...cart, product]);
  };

  return React.createElement('div', {
    style: {
      minHeight: '100vh',
      background: '#f8fafc',
      padding: '2rem',
      fontFamily: 'Inter, sans-serif'
    }
  }, [
    React.createElement('h1', {
      key: 'title',
      style: {
        fontSize: '2rem',
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: '2rem',
        color: '#1e293b'
      }
    }, 'E-commerce Store'),
    React.createElement('div', {
      key: 'products',
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem'
      }
    }, products.map(product => 
      React.createElement('div', {
        key: product.id,
        style: {
          background: 'white',
          padding: '1rem',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }
      }, [
        React.createElement('img', {
          key: 'image',
          src: product.image,
          alt: product.name,
          style: { width: '100%', height: '150px', objectFit: 'cover', borderRadius: '4px' }
        }),
        React.createElement('h3', {
          key: 'name',
          style: { margin: '0.5rem 0', fontSize: '1.1rem', fontWeight: '600' }
        }, product.name),
        React.createElement('p', {
          key: 'price',
          style: { fontSize: '1.2rem', fontWeight: 'bold', color: '#10b981' }
        }, '$' + product.price),
        React.createElement('button', {
          key: 'add',
          onClick: () => addToCart(product),
          style: {
            width: '100%',
            padding: '0.5rem',
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }
        }, 'Add to Cart')
      ])
    ))
  ]);
};

export default EcommerceStore;`
  },
  {
    id: 'portfolio',
    name: 'Portfolio Website',
    description: 'Professional portfolio with projects and contact form',
    category: 'Personal',
    icon: User,
    difficulty: 'intermediate',
    rating: 4.7,
    tags: ['portfolio', 'personal', 'projects', 'contact'],
    code: `import React from 'react';

const Portfolio = () => {
  const [activeSection, setActiveSection] = React.useState('about');

  return React.createElement('div', {
    style: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: 'Inter, sans-serif'
    }
  }, [
    React.createElement('nav', {
      key: 'nav',
      style: {
        padding: '1rem 2rem',
        background: 'rgba(255,255,255,0.1)',
        backdropFilter: 'blur(10px)'
      }
    }, [
      React.createElement('h1', {
        key: 'logo',
        style: { color: 'white', fontSize: '1.5rem', fontWeight: 'bold' }
      }, 'Portfolio'),
      React.createElement('div', {
        key: 'nav-items',
        style: { display: 'flex', gap: '2rem' }
      }, ['About', 'Projects', 'Contact'].map(item =>
        React.createElement('button', {
          key: item,
          onClick: () => setActiveSection(item.toLowerCase()),
          style: {
            color: 'white',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '0.5rem 1rem',
            borderRadius: '4px',
            transition: 'background 0.2s'
          }
        }, item)
      ))
    ]),
    React.createElement('main', {
      key: 'main',
      style: { padding: '2rem' }
    }, [
      React.createElement('div', {
        key: 'hero',
        style: {
          textAlign: 'center',
          color: 'white',
          marginBottom: '3rem'
        }
      }, [
        React.createElement('h2', {
          key: 'title',
          style: { fontSize: '3rem', fontWeight: 'bold', marginBottom: '1rem' }
        }, 'Welcome to My Portfolio'),
        React.createElement('p', {
          key: 'subtitle',
          style: { fontSize: '1.2rem', opacity: 0.9 }
        }, 'Full-stack developer passionate about creating amazing web experiences')
      ])
    ])
  ]);
};

export default Portfolio;`
  }
];

const CodeTemplates: React.FC<{
  onTemplateSelect: (code: string) => void;
}> = ({ onTemplateSelect }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'rating' | 'difficulty'>('name');

  const categories = ['all', ...new Set(templates.map(t => t.category))];

  const filteredTemplates = templates
    .filter(template => 
      (selectedCategory === 'all' || template.category === selectedCategory) &&
      (template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
       template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
       template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())))
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'difficulty':
          return a.difficulty.localeCompare(b.difficulty);
        default:
          return a.name.localeCompare(b.name);
      }
    });

  const handleTemplateSelect = (template: Template) => {
    onTemplateSelect(template.code);
    toast.success(`${template.name} template loaded!`);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Template code copied to clipboard!');
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Sparkles className="w-6 h-6 text-primary-600" />
            <h2 className="text-2xl font-bold text-gray-900">Code Templates</h2>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">{filteredTemplates.length} templates</span>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          {/* Search */}
          <div className="flex-1 min-w-64">
            <input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="name">Sort by Name</option>
            <option value="rating">Sort by Rating</option>
            <option value="difficulty">Sort by Difficulty</option>
          </select>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => {
            const Icon = template.icon;
            return (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-lg border border-gray-200 hover:border-primary-300 hover:shadow-lg transition-all duration-200"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-primary-100 rounded-lg">
                        <Icon className="w-6 h-6 text-primary-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <div className="flex items-center space-x-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < Math.floor(template.rating) 
                                    ? 'text-yellow-400 fill-current' 
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-gray-500">({template.rating})</span>
                        </div>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      template.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                      template.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {template.difficulty}
                    </span>
                  </div>

                  <p className="text-gray-600 mb-4">{template.description}</p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {template.tags.map(tag => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleTemplateSelect(template)}
                      className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <Play className="w-4 h-4" />
                      <span>Use Template</span>
                    </button>
                    <button
                      onClick={() => handleCopyCode(template.code)}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      title="Copy code"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {filteredTemplates.length === 0 && (
          <div className="text-center py-12">
            <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
            <p className="text-gray-500">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CodeTemplates; 