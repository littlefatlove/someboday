window.requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
        console.log("This browser does not support desktop notification");
        return;
    }
    
    if (Notification.permission === "granted") {
        return true;
    }
    
    if (Notification.permission !== "denied") {
        const permission = await Notification.requestPermission();
        return permission === "granted";
    }
    return false;
};

window.showNotification = (title, options = {}) => {
    // 1. Native Desktop Notification
    if ("Notification" in window && Notification.permission === "granted") {
        try {
            const notification = new Notification(title, {
                icon: 'https://app.trickle.so/storage/public/images/anonymous/b88ec477-8a11-4117-b259-1a83974592eb.png',
                ...options
            });
            
            notification.onclick = function() {
                window.focus();
                this.close();
            };
        } catch (e) {
            console.warn("Native notification failed", e);
        }
    }

    // 2. In-App Toast Notification (Reliable fallback)
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'fixed top-4 right-4 z-[9999] flex flex-col space-y-2 pointer-events-none';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'bg-white/95 backdrop-blur-md border border-emerald-100 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-2xl p-4 w-72 transform transition-all duration-500 translate-x-full opacity-0 pointer-events-auto flex items-start';
    
    const bodyHtml = options.body ? '<p class="text-xs text-gray-500 mt-1 line-clamp-2">' + options.body + '</p>' : '';
    
    toast.innerHTML = 
        '<div class="flex-1 min-w-0">' +
            '<h4 class="text-sm font-bold text-gray-800 truncate flex items-center">' +
                '<div class="icon-bell mr-2 text-[var(--primary-color)]"></div>' +
                title +
            '</h4>' +
            bodyHtml +
        '</div>' +
        '<button class="ml-3 text-gray-400 hover:text-gray-600 focus:outline-none p-1 bg-gray-50 rounded-full" onclick="this.parentElement.remove()">' +
            '<div class="icon-x text-xs"></div>' +
        '</button>';

    container.appendChild(toast);

    requestAnimationFrame(() => {
        toast.classList.remove('translate-x-full', 'opacity-0');
    });

    setTimeout(() => {
        toast.classList.add('translate-x-full', 'opacity-0');
        setTimeout(() => toast.remove(), 500);
    }, 5000);
};

// Request permission on script load
setTimeout(() => {
    window.requestNotificationPermission();
}, 2000);