import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

// Renders trusted post content (Markdown authored by the site owner) with the
// themed `.prose-content` styles. Links open safely in a new tab.
export default function Markdown({ children, className = '' }) {
  return (
    <div className={`prose-content ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ node: _node, ...props }) => (
            <a target="_blank" rel="noreferrer noopener" {...props} />
          ),
        }}
      >
        {children || ''}
      </ReactMarkdown>
    </div>
  )
}
