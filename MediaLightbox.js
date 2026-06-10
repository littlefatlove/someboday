function MediaLightbox({ src, type, onClose }) {
    if (!src) return null;

    return (
        <div 
            className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center animate-fade-in"
            onClick={onClose}
        >
            {type !== 'video' && (
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 text-white/70 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors z-50"
                >
                    <div className="icon-x text-3xl"></div>
                </button>
            )}
            
            <div 
                className="relative flex items-center justify-center w-full h-full p-4"
                onClick={e => e.stopPropagation()}
            >
                {type === 'video' ? (
                    <div className="relative w-full max-w-4xl aspect-video rounded-xl overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.5)] border border-white/10 animate-scale-in bg-black">
                        <CustomVideoPlayer 
                            src={src} 
                            autoPlay={true}
                            onBack={onClose}
                            className="w-full h-full"
                        />
                    </div>
                ) : (
                    <img 
                        src={src} 
                        alt="Enlarged media" 
                        className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl animate-scale-in"
                    />
                )}
            </div>
        </div>
    );
}