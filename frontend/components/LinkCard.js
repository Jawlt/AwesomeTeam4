export default function LinkCard({ title, link }) {
    const copyToClipboard = async () => {
      try {
        await navigator.clipboard.writeText(link);
        alert('Link copied to clipboard!');
      } catch (err) {
        console.error('Failed to copy text: ', err);
      }
    };
  
    return (
      <div className="bg-card rounded-lg shadow-md p-4 border border-dark/10">
        <h3 className="text-lg font-semibold mb-2 text-primary">{title}</h3>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={link}
            readOnly
            className="flex-1 bg-background px-3 py-2 rounded border border-dark/20 text-sm text-dark"
          />
          <button
            onClick={copyToClipboard}
            className="p-2 text-secondary hover:text-secondary-hover transition-colors"
          >
            📋
          </button>
        </div>
      </div>
    );
  }