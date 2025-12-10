import { useState } from "react";

export default function Tooltip({ children, text }) {
    const [visible, setVisible] = useState(false);

    return (
        <div
            className="relative inline-block"
            onMouseEnter={() => setVisible(true)}
            onMouseLeave={() => setVisible(false)}
        >
            {children}

            <div
                className={`absolute left-1/2 -translate-x-1/2 -top-2 z-50 bg-gray-800 text-white text-sm px-3 py-1 rounded shadow-lg whitespace-nowrap
                    transition-all duration-200 origin-bottom
                    ${visible ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-90 pointer-events-none"}
                `}
                style={{ transform: 'translate(-50%, -100%)' }}
            >
                {text}
            </div>
        </div>
    );
}
