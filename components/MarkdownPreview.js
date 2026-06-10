function MarkdownPreview() {
    const [markdown, setMarkdown] = React.useState('# 歡迎使用 Markdown\n\n這是一個簡單的 **Markdown** 預覽工具。\n\n## 支援語法\n- 標題 (H1-H6)\n- **粗體** 和 *斜體*\n- [連結](https://google.com)\n- 列表\n\n> 這是一段引用文字');

    // Naive simple markdown parser
    const getHtml = () => {
        let html = markdown
            // Headers
            .replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold mt-4 mb-2">$1</h3>')
            .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold mt-5 mb-3 border-b pb-1">$1</h2>')
            .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mt-6 mb-4 border-b pb-2">$1</h1>')
            // Bold
            .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
            // Italic
            .replace(/\*(.*)\*/gim, '<em>$1</em>')
            // Links
            .replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2" target="_blank" class="text-blue-500 hover:underline">$1</a>')
            // Blockquote
            .replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-gray-300 pl-4 py-1 my-2 text-gray-600 bg-gray-50">$1</blockquote>')
            // Lists
            .replace(/^\s*\- (.*$)/gim, '<li class="ml-6 list-disc">$1</li>')
            // Paragraphs (naive)
            .replace(/\n$/gim, '<br />');

        return { __html: html };
    };

    return (
        <div className="flex-1 bg-gray-50 p-6 overflow-y-auto w-full">
            <div className="max-w-6xl mx-auto bg-white p-6 rounded-3xl shadow-sm border border-gray-100 h-full flex flex-col" style={{ minHeight: '80vh' }}>
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center shrink-0">
                    <div className="icon-file-type-2 mr-3 text-indigo-500"></div>
                    簡易 Markdown 預覽
                </h2>
                
                <div className="flex flex-col md:flex-row gap-6 flex-1 min-h-0">
                    <div className="flex-1 flex flex-col min-h-[300px]">
                        <label className="text-sm font-bold text-gray-600 mb-2">編輯區</label>
                        <textarea 
                            value={markdown}
                            onChange={e => setMarkdown(e.target.value)}
                            className="flex-1 w-full border-gray-200 rounded-xl focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] font-mono text-sm resize-none p-4"
                        ></textarea>
                    </div>
                    <div className="flex-1 flex flex-col min-h-[300px]">
                        <label className="text-sm font-bold text-gray-600 mb-2">預覽區</label>
                        <div 
                            className="flex-1 w-full border border-gray-200 rounded-xl bg-white p-6 overflow-y-auto custom-scrollbar prose prose-emerald"
                            dangerouslySetInnerHTML={getHtml()}
                        ></div>
                    </div>
                </div>
            </div>
        </div>
    );
}