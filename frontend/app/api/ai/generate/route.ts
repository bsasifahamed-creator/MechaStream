import { NextRequest, NextResponse } from 'next/server';
import { RealProviderConnector } from '@/services/RealProviderConnector';

const AI_SYSTEM_PROMPT = `You are an expert React developer and UI designer. Your task is to generate clean, functional React code based on user requests.

IMPORTANT REQUIREMENTS:
1. DO NOT use JSX syntax - use React.createElement() instead
2. Generate complete, working React components
3. Use modern React patterns and hooks
4. Include proper error handling
5. Make components responsive and accessible
6. Use semantic HTML elements
7. Include proper TypeScript types when needed

Example format:
const App = () => {
  return React.createElement('div', { className: 'container' },
    React.createElement('h1', null, 'Hello World'),
    React.createElement('p', null, 'This is a React component')
  );
};

Generate only the React component code, no explanations or markdown.`;

export async function POST(request: NextRequest) {
  try {
    const { prompt, useWebSearch = false } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const connector = RealProviderConnector.getInstance();
    const availableProviders = connector.getAvailableProviders();

    // If no providers are available, use a simple fallback
    if (availableProviders.length === 0) {
      const fallbackCode = generateBasicFallback(prompt);
      return NextResponse.json({
        success: true,
        code: fallbackCode,
        provider: 'fallback',
        model: 'basic-generator',
        responseTime: 100,
        usage: { inputTokens: 0, outputTokens: 0, cost: 0 },
        originalProvider: 'fallback',
        fallbackAttempts: 0,
        fallbackMethod: 'basic-generator'
      });
    }

    // Try providers in order of preference
    const providerOrder = ['openrouter', 'openai', 'anthropic', 'google'];
    let lastError = '';
    let fallbackAttempts = 0;

    for (const provider of providerOrder) {
      if (!availableProviders.includes(provider)) continue;

      try {
        let response;
        
        if (provider === 'google') {
          response = await connector.generateWithGoogle(prompt);
        } else if (provider === 'anthropic') {
          response = await connector.generateWithAnthropic(prompt);
        } else {
          response = await connector.generateWithOpenAI(provider, prompt);
        }

        if (response.success && response.content) {
          // Add React import and export
          const code = `import React from 'react';\n\n${response.content}\n\nexport default App;`;
          
          return NextResponse.json({
            success: true,
            code,
            provider: response.metadata?.provider || provider,
            model: response.metadata?.model,
            responseTime: response.metadata?.responseTime,
            usage: response.usage,
            originalProvider: provider,
            fallbackAttempts
          });
        } else {
          lastError = response.error || 'Unknown error';
          fallbackAttempts++;
        }
      } catch (error: any) {
        lastError = error.message || 'Unknown error';
        fallbackAttempts++;
      }
    }

    // If all providers fail, try web search fallback
    if (useWebSearch) {
      try {
        const searchResponse = await fetch(`${request.nextUrl.origin}/api/web-search`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: prompt })
        });

        if (searchResponse.ok) {
          const searchData = await searchResponse.json();
          if (searchData.results && searchData.results.length > 0) {
            const fallbackCode = generateCodeFromSearchResults(searchData.results, prompt);
            return NextResponse.json({
              success: true,
              code: fallbackCode,
              provider: 'web-search',
              model: 'search-based',
              responseTime: 2000,
              usage: { inputTokens: 0, outputTokens: 0, cost: 0 },
              originalProvider: 'web-search',
              fallbackAttempts,
              fallbackMethod: 'search-results-only',
              searchResultsUsed: searchData.results.length
            });
          }
        }
      } catch (error) {
        console.error('Web search fallback failed:', error);
      }
    }

    // Final fallback - generate basic code
    const fallbackCode = generateBasicFallback(prompt);
    return NextResponse.json({
      success: true,
      code: fallbackCode,
      provider: 'fallback',
      model: 'basic-generator',
      responseTime: 100,
      usage: { inputTokens: 0, outputTokens: 0, cost: 0 },
      originalProvider: 'fallback',
      fallbackAttempts,
      fallbackMethod: 'basic-generator',
      error: lastError
    });

  } catch (error: any) {
    console.error('AI generation error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to generate code',
      suggestion: 'Please try again with a different prompt or check your API configuration.'
    }, { status: 500 });
  }
}

function generateCodeFromSearchResults(results: any[], prompt: string): string {
  const relevantResults = results.slice(0, 3);
  const context = relevantResults.map(result => result.snippet).join('\n');
  
  return `import React from 'react';

const App = () => {
  const [data, setData] = React.useState({
    title: '${prompt.split(' ').slice(0, 3).join(' ')}',
    description: 'Generated from web search results'
  });

  return React.createElement('div', {
    style: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Arial, sans-serif',
      padding: '2rem'
    }
  }, [
    React.createElement('div', {
      key: 'card',
      style: {
        background: 'white',
        padding: '2rem',
        borderRadius: '12px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
        maxWidth: '600px',
        width: '100%',
        textAlign: 'center'
      }
    }, [
      React.createElement('h1', {
        key: 'title',
        style: {
          fontSize: '2rem',
          fontWeight: 'bold',
          marginBottom: '1rem',
          color: '#1e293b'
        }
      }, data.title),
      React.createElement('p', {
        key: 'description',
        style: {
          color: '#666',
          marginBottom: '1.5rem',
          fontSize: '1.1rem'
        }
      }, data.description),
      React.createElement('div', {
        key: 'search-results',
        style: {
          textAlign: 'left',
          background: '#f8fafc',
          padding: '1rem',
          borderRadius: '8px',
          marginTop: '1rem'
        }
      }, [
        React.createElement('h3', {
          key: 'results-title',
          style: {
            fontSize: '1.1rem',
            fontWeight: '600',
            marginBottom: '0.5rem',
            color: '#374151'
          }
        }, 'Search Results:'),
        ...relevantResults.map((result, index) => 
          React.createElement('div', {
            key: \`result-\${index}\`,
            style: {
              marginBottom: '0.5rem',
              fontSize: '0.9rem',
              color: '#6b7280'
            }
          }, result.snippet.substring(0, 100) + '...')
        )
      ])
    ])
  ]);
};

export default App;`;
}

function generateBasicFallback(prompt: string): string {
  const words = prompt.toLowerCase().split(' ');
  const isCounter = words.includes('counter') || words.includes('count');
  const isCalculator = words.includes('calculator') || words.includes('calc');
  const isTodo = words.includes('todo') || words.includes('task') || words.includes('list');
  const isForm = words.includes('form') || words.includes('input') || words.includes('submit');
  
  if (isCounter) {
    return `import React from 'react';

const App = () => {
  const [count, setCount] = React.useState(0);
  
  return React.createElement('div', {
    style: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Arial, sans-serif'
    }
  }, [
    React.createElement('div', {
      key: 'card',
      style: {
        background: 'white',
        padding: '2rem',
        borderRadius: '12px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
        maxWidth: '400px',
        width: '100%',
        textAlign: 'center'
      }
    }, [
      React.createElement('h1', {
        key: 'title',
        style: {
          fontSize: '2rem',
          fontWeight: 'bold',
          marginBottom: '1.5rem',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }
      }, 'Counter App'),
      React.createElement('p', {
        key: 'count',
        style: {
          color: '#666',
          marginBottom: '1rem',
          fontSize: '1.1rem'
        }
      }, \`Count: \${count}\`),
      React.createElement('button', {
        key: 'button',
        onClick: () => setCount(count + 1),
        style: {
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          border: 'none',
          padding: '0.75rem 1.5rem',
          borderRadius: '8px',
          fontSize: '1rem',
          cursor: 'pointer',
          transition: 'transform 0.2s'
        }
      }, 'Increment')
    ])
  ]);
};

export default App;`;
  }
  
  if (isCalculator) {
    return `import React from 'react';

const App = () => {
  const [display, setDisplay] = React.useState('0');
  const [equation, setEquation] = React.useState('');
  
  const handleNumber = (num) => {
    if (display === '0') {
      setDisplay(num);
    } else {
      setDisplay(display + num);
    }
  };
  
  const handleOperator = (op) => {
    setEquation(display + ' ' + op + ' ');
    setDisplay('0');
  };
  
  const calculate = () => {
    try {
      const result = eval(equation + display);
      setDisplay(result.toString());
      setEquation('');
    } catch (error) {
      setDisplay('Error');
    }
  };
  
  return React.createElement('div', {
    style: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Arial, sans-serif'
    }
  }, [
    React.createElement('div', {
      key: 'calculator',
      style: {
        background: 'white',
        padding: '1.5rem',
        borderRadius: '12px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
        width: '300px'
      }
    }, [
      React.createElement('div', {
        key: 'display',
        style: {
          background: '#f8fafc',
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '1rem',
          textAlign: 'right',
          fontSize: '1.5rem',
          fontFamily: 'monospace'
        }
      }, equation + display),
      React.createElement('div', {
        key: 'buttons',
        style: {
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '0.5rem'
        }
      }, [
        ['7', '8', '9', '/'],
        ['4', '5', '6', '*'],
        ['1', '2', '3', '-'],
        ['0', '.', '=', '+']
      ].flat().map(btn => 
        React.createElement('button', {
          key: btn,
          onClick: () => {
            if (btn === '=') calculate();
            else if (['+', '-', '*', '/'].includes(btn)) handleOperator(btn);
            else handleNumber(btn);
          },
          style: {
            padding: '1rem',
            fontSize: '1.2rem',
            border: 'none',
            borderRadius: '8px',
            background: ['+', '-', '*', '/', '='].includes(btn) ? '#3b82f6' : '#f1f5f9',
            color: ['+', '-', '*', '/', '='].includes(btn) ? 'white' : '#1e293b',
            cursor: 'pointer'
          }
        }, btn)
      ))
    ])
  ]);
};

export default App;`;
  }
  
  if (isTodo) {
    return `import React from 'react';

const App = () => {
  const [todos, setTodos] = React.useState([]);
  const [input, setInput] = React.useState('');
  
  const addTodo = () => {
    if (input.trim()) {
      setTodos([...todos, { id: Date.now(), text: input, completed: false }]);
      setInput('');
    }
  };
  
  const toggleTodo = (id) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };
  
  return React.createElement('div', {
    style: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '2rem',
      fontFamily: 'Arial, sans-serif'
    }
  }, [
    React.createElement('div', {
      key: 'container',
      style: {
        maxWidth: '500px',
        margin: '0 auto',
        background: 'white',
        padding: '2rem',
        borderRadius: '12px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
      }
    }, [
      React.createElement('h1', {
        key: 'title',
        style: {
          fontSize: '2rem',
          fontWeight: 'bold',
          marginBottom: '1.5rem',
          textAlign: 'center',
          color: '#1e293b'
        }
      }, 'Todo List'),
      React.createElement('div', {
        key: 'input-section',
        style: {
          display: 'flex',
          gap: '0.5rem',
          marginBottom: '1.5rem'
        }
      }, [
        React.createElement('input', {
          key: 'input',
          type: 'text',
          value: input,
          onChange: (e) => setInput(e.target.value),
          onKeyPress: (e) => e.key === 'Enter' && addTodo(),
          placeholder: 'Add a new task...',
          style: {
            flex: 1,
            padding: '0.75rem',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            fontSize: '1rem'
          }
        }),
        React.createElement('button', {
          key: 'add-btn',
          onClick: addTodo,
          style: {
            padding: '0.75rem 1.5rem',
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }
        }, 'Add')
      ]),
      React.createElement('div', {
        key: 'todos',
        style: {
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem'
        }
      }, todos.map(todo => 
        React.createElement('div', {
          key: todo.id,
          onClick: () => toggleTodo(todo.id),
          style: {
            padding: '0.75rem',
            background: todo.completed ? '#f0f9ff' : '#f8fafc',
            borderRadius: '8px',
            cursor: 'pointer',
            textDecoration: todo.completed ? 'line-through' : 'none',
            color: todo.completed ? '#6b7280' : '#1e293b'
          }
        }, todo.text)
      ))
    ])
  ]);
};

export default App;`;
  }
  
  if (isForm) {
    return `import React from 'react';

const App = () => {
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    message: ''
  });
  
  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Form submitted! Check console for data.');
    console.log('Form data:', formData);
  };
  
  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };
  
  return React.createElement('div', {
    style: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Arial, sans-serif',
      padding: '2rem'
    }
  }, [
    React.createElement('form', {
      key: 'form',
      onSubmit: handleSubmit,
      style: {
        background: 'white',
        padding: '2rem',
        borderRadius: '12px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '400px'
      }
    }, [
      React.createElement('h1', {
        key: 'title',
        style: {
          fontSize: '2rem',
          fontWeight: 'bold',
          marginBottom: '1.5rem',
          textAlign: 'center',
          color: '#1e293b'
        }
      }, 'Contact Form'),
      React.createElement('div', {
        key: 'name-field',
        style: { marginBottom: '1rem' }
      }, [
        React.createElement('label', {
          key: 'name-label',
          style: {
            display: 'block',
            marginBottom: '0.5rem',
            fontWeight: '600',
            color: '#374151'
          }
        }, 'Name'),
        React.createElement('input', {
          key: 'name-input',
          type: 'text',
          value: formData.name,
          onChange: (e) => handleChange('name', e.target.value),
          required: true,
          style: {
            width: '100%',
            padding: '0.75rem',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            fontSize: '1rem'
          }
        })
      ]),
      React.createElement('div', {
        key: 'email-field',
        style: { marginBottom: '1rem' }
      }, [
        React.createElement('label', {
          key: 'email-label',
          style: {
            display: 'block',
            marginBottom: '0.5rem',
            fontWeight: '600',
            color: '#374151'
          }
        }, 'Email'),
        React.createElement('input', {
          key: 'email-input',
          type: 'email',
          value: formData.email,
          onChange: (e) => handleChange('email', e.target.value),
          required: true,
          style: {
            width: '100%',
            padding: '0.75rem',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            fontSize: '1rem'
          }
        })
      ]),
      React.createElement('div', {
        key: 'message-field',
        style: { marginBottom: '1.5rem' }
      }, [
        React.createElement('label', {
          key: 'message-label',
          style: {
            display: 'block',
            marginBottom: '0.5rem',
            fontWeight: '600',
            color: '#374151'
          }
        }, 'Message'),
        React.createElement('textarea', {
          key: 'message-input',
          value: formData.message,
          onChange: (e) => handleChange('message', e.target.value),
          required: true,
          rows: 4,
          style: {
            width: '100%',
            padding: '0.75rem',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            fontSize: '1rem',
            resize: 'vertical'
          }
        })
      ]),
      React.createElement('button', {
        key: 'submit-btn',
        type: 'submit',
        style: {
          width: '100%',
          padding: '0.75rem',
          background: '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '1rem',
          cursor: 'pointer'
        }
      }, 'Submit')
    ])
  ]);
};

export default App;`;
  }
  
  // Default fallback
  return `import React from 'react';

const App = () => {
  const [count, setCount] = React.useState(0);
  
  return React.createElement('div', {
    style: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Arial, sans-serif'
    }
  }, [
    React.createElement('div', {
      key: 'card',
      style: {
        background: 'white',
        padding: '2rem',
        borderRadius: '12px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
        maxWidth: '400px',
        width: '100%',
        textAlign: 'center'
      }
    }, [
      React.createElement('h1', {
        key: 'title',
        style: {
          fontSize: '2rem',
          fontWeight: 'bold',
          marginBottom: '1.5rem',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }
      }, 'AI Generated App'),
      React.createElement('p', {
        key: 'description',
        style: {
          color: '#666',
          marginBottom: '1rem',
          fontSize: '1.1rem'
        }
      }, 'This is a basic React app generated for: ' + prompt),
      React.createElement('p', {
        key: 'count',
        style: {
          color: '#666',
          marginBottom: '1rem',
          fontSize: '1.1rem'
        }
      }, \`Count: \${count}\`),
      React.createElement('button', {
        key: 'button',
        onClick: () => setCount(count + 1),
        style: {
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          border: 'none',
          padding: '0.75rem 1.5rem',
          borderRadius: '8px',
          fontSize: '1rem',
          cursor: 'pointer',
          transition: 'transform 0.2s'
        }
      }, 'Increment')
    ])
  ]);
};

export default App;`;
}