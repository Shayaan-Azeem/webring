import { getAllMembers } from '@/lib/db';
import WebringList from '@/components/WebringList';
import BackgroundDecorations from '@/components/BackgroundDecorations';
import ConnectionGraph from '@/components/ConnectionGraph';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const members = await getAllMembers();

  return (
    <main className="bg-black text-white px-4 py-6 sm:p-8 min-h-screen w-full overflow-x-hidden relative">
      <BackgroundDecorations />
      
      <div className="w-full relative z-10 flex gap-12 items-start">
        {/* Left side - Connection Graph */}
        <div className="hidden lg:flex w-1/2 flex-col">
          <ConnectionGraph members={members} />
        </div>
        
        {/* Right side - Member List */}
        <div className="w-full lg:w-1/2">
          <WebringList members={members} />
        </div>
      </div>
    </main>
  );
}

