// Main Chat Application Entry
// Components will be defined in separate files or here for simplicity if needed
// but we will use components/ChatInterface.js for the main logic

// Reusing ErrorBoundary
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h1 className="text-xl font-bold mb-2">Something went wrong</h1>
            <button onClick={() => window.location.reload()} className="underline text-blue-600">Reload</button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function ChatApp() {
    const [isAuthenticated, setIsAuthenticated] = React.useState(false);
    const [tabs, setTabs] = React.useState([{ id: 'tab-' + Date.now(), title: '首頁' }]);
    const [activeTabId, setActiveTabId] = React.useState('');
    const [showTabsModal, setShowTabsModal] = React.useState(false);

    React.useEffect(() => {
        if (tabs.length > 0 && !activeTabId) {
            setActiveTabId(tabs[0].id);
        }
    }, [tabs]);

    React.useEffect(() => {
        try {
            const userStr = localStorage.getItem('chat_user');
            const expiresStr = localStorage.getItem('chat_auth_expires');
            
            if (userStr && !expiresStr) {
                // Backward compatibility
                localStorage.setItem('chat_auth_expires', Date.now() + 5 * 24 * 60 * 60 * 1000);
                setIsAuthenticated(true);
            } else if (!userStr || !expiresStr || Date.now() > parseInt(expiresStr, 10)) {
                // Not logged in or expired
                localStorage.removeItem('chat_user');
                localStorage.removeItem('chat_auth_expires');
                window.location.href = 'index.html';
            } else {
                // Extend expiration to 5 days from now upon activity
                localStorage.setItem('chat_auth_expires', Date.now() + 5 * 24 * 60 * 60 * 1000);
                setIsAuthenticated(true);
            }
        } catch (e) {
            console.error('Auth check error:', e);
            window.location.href = 'index.html';
        }
    }, []);

    if (!isAuthenticated) {
        return (
            <div className="h-screen flex items-center justify-center bg-gray-50">
                <div className="icon-loader animate-spin text-4xl text-[var(--primary-color)]"></div>
            </div>
        );
    }

    const handleAddTab = () => {
        const newTab = { id: 'tab-' + Date.now(), title: '新分頁' };
        setTabs([...tabs, newTab]);
        setActiveTabId(newTab.id);
        setShowTabsModal(false);
    };

    const handleCloseTab = (e, tabId) => {
        e.stopPropagation();
        if (tabs.length === 1) return; // keep at least one
        const newTabs = tabs.filter(t => t.id !== tabId);
        setTabs(newTabs);
        if (activeTabId === tabId) {
            setActiveTabId(newTabs[newTabs.length - 1].id);
        }
    };

    const handleUpdateTab = (tabId, info) => {
        setTabs(prev => prev.map(t => t.id === tabId ? { ...t, ...info } : t));
    };

    return (
        <div className="relative w-full h-full overflow-hidden bg-gray-50">
            {tabs.map(tab => (
                <div 
                    key={tab.id} 
                    className={`absolute inset-0 w-full h-full transition-opacity duration-300 ${tab.id === activeTabId ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'}`}
                >
                    {/* Only render if it's active or has been rendered before, wait, better to always render to keep state, or we can just always render them */}
                    <ChatInterface 
                        onUpdateTab={(info) => handleUpdateTab(tab.id, info)} 
                        onAddTab={handleAddTab}
                        onShowTabsModal={() => setShowTabsModal(true)}
                        tabsCount={tabs.length}
                    />
                </div>
            ))}

            {/* Tabs Manager Modal */}
            {showTabsModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4 animate-fade-in" onClick={() => setShowTabsModal(false)}>
                    <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl border border-gray-100" onClick={e => e.stopPropagation()}>
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h3 className="text-lg font-bold text-gray-800 flex items-center">
                                <div className="icon-layers mr-2 text-[var(--primary-color)]"></div>
                                分頁管理
                            </h3>
                            <button onClick={() => setShowTabsModal(false)} className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-200 rounded-full transition-colors">
                                <div className="icon-x"></div>
                            </button>
                        </div>
                        <div className="p-4 max-h-[60vh] overflow-y-auto custom-scrollbar space-y-2">
                            {tabs.map((tab, idx) => (
                                <div 
                                    key={tab.id}
                                    onClick={() => { setActiveTabId(tab.id); setShowTabsModal(false); }}
                                    className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border ${tab.id === activeTabId ? 'bg-emerald-50 border-emerald-200 shadow-sm' : 'bg-white border-gray-100 hover:border-emerald-100 hover:bg-gray-50'}`}
                                >
                                    <div className="flex items-center overflow-hidden">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 flex-shrink-0 ${tab.id === activeTabId ? 'bg-[var(--primary-color)] text-white' : 'bg-gray-100 text-gray-500'}`}>
                                            {idx + 1}
                                        </div>
                                        <span className={`font-bold text-sm truncate ${tab.id === activeTabId ? 'text-emerald-800' : 'text-gray-700'}`}>
                                            {tab.title}
                                        </span>
                                    </div>
                                    {tabs.length > 1 && (
                                        <button 
                                            onClick={(e) => handleCloseTab(e, tab.id)}
                                            className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0 ml-2"
                                            title="關閉分頁"
                                        >
                                            <div className="icon-trash-2 text-sm"></div>
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="p-4 border-t border-gray-100 bg-gray-50">
                            <button 
                                onClick={handleAddTab}
                                className="w-full py-3 bg-[var(--primary-color)] text-white rounded-xl font-bold shadow-lg shadow-emerald-200 hover:bg-[var(--primary-hover)] transition-all flex items-center justify-center"
                            >
                                <div className="icon-plus mr-2"></div>
                                新增分頁
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ErrorBoundary>
    <ChatApp />
  </ErrorBoundary>
);