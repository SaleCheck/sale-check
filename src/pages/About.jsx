import { useEffect } from "react";

export default function About() {    
    useEffect(() => {
        document.title = "SaleCheck | About"
    }, []);
    
    return (
        <div className="max-w-3xl mx-auto mt-24 px-6">
            <h1 className="text-5xl font-extrabold mb-6 text-gray-900">About Us</h1>
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Inspiration</h2>
            <p className="text-lg text-gray-700">
                A similar product exists on:{" "}
                <a
                    href="https://goma.gg"
                    className="text-blue-600 underline hover:text-blue-800"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    goma.gg
                </a>
                .
            </p>
            <ul className="list-disc pl-6">
                <li className="text-lg text-gray-700">
                    Built by{" "}
                    <a
                        href="https://www.linkedin.com/in/nikolaj-munster/?originalSubdomain=dk"
                        className="text-blue-600 underline hover:text-blue-800"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Nikolaj Englmayer Münster
                    </a>
                </li>
                <li className="text-lg text-gray-700">
                    Article on Danish national Broadcaster:{" "}
                    <a
                        href="https://www.dr.dk/nyheder/penge/jagten-paa-billige-foedevarer-har-faaet-nikolaj-til-udvikle-en-digital-tilbudsjaeger"
                        className="text-blue-600 underline hover:text-blue-800"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        DR | Jagten på billige fødevarer
                    </a>
                    .
                </li>
            </ul>
        </div>
    );
}