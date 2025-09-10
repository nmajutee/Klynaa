import Head from 'next/head';

const TestLogin: React.FC = () => {
    return (
        <>
            <Head>
                <title>Test Login - Klynaa</title>
            </Head>

            <div className="min-h-screen bg-red-500 flex items-center justify-center">
                <div className="bg-white p-8 rounded-lg shadow-lg">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Test Page</h1>
                    <p className="text-gray-600 mb-4">If you can see this styled correctly, TailwindCSS is working.</p>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                        Test Button
                    </button>
                </div>
            </div>
        </>
    );
};

export default TestLogin;
