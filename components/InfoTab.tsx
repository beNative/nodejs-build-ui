import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import electronAPI from '../services/electronAPI';
import { SpinnerIcon } from './Icons';

type DocName = 'README.md' | 'FUNCTIONAL_MANUAL.md' | 'TECHNICAL_MANUAL.md' | 'VERSION_LOG.md';

const docFiles: { name: DocName, title: string }[] = [
    { name: 'README.md', title: 'Readme' },
    { name: 'FUNCTIONAL_MANUAL.md', title: 'Functional Manual' },
    { name: 'TECHNICAL_MANUAL.md', title: 'Technical Manual' },
    { name: 'VERSION_LOG.md', title: 'Version Log' },
];

const InfoTab: React.FC = () => {
    const [activeDoc, setActiveDoc] = useState<DocName>('README.md');
    const [content, setContent] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchContent = async () => {
            setIsLoading(true);
            try {
                const markdown = await electronAPI.getMarkdownContent(activeDoc);
                setContent(markdown);
            } catch (error) {
                setContent(`# Error\n\nCould not load document: ${activeDoc}`);
                console.error(error);
            }
            setIsLoading(false);
        };

        fetchContent();
    }, [activeDoc]);
    
    return (
        <div className="bg-gray-800 rounded-lg shadow-inner h-full flex flex-col">
            <header className="p-2 border-b border-gray-700 flex-shrink-0">
                <nav className="flex space-x-2">
                    {docFiles.map(doc => (
                        <button 
                            key={doc.name}
                            onClick={() => setActiveDoc(doc.name)}
                            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                                activeDoc === doc.name
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-300 hover:bg-gray-700/50'
                            }`}
                        >
                            {doc.title}
                        </button>
                    ))}
                </nav>
            </header>
            <main className="p-6 overflow-y-auto flex-grow">
                {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                        <SpinnerIcon className="w-10 h-10 text-blue-500" />
                    </div>
                ) : (
                    <article className="prose prose-invert prose-sm sm:prose-base max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
                    </article>
                )}
            </main>
        </div>
    );
};

export default InfoTab;
