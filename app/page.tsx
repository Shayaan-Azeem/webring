import { getAllMembers } from '@/lib/db';
import WebringList from '@/components/WebringList';
import BackgroundDecorations from '@/components/BackgroundDecorations';
import ConnectionGraph from '@/components/ConnectionGraph';
import MissingWebringComponentList from '@/components/MissingWebringComponentList';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const members = await getAllMembers();

  return (
    <main className="bg-black text-white px-4 py-6 sm:p-8 min-h-screen w-full overflow-x-hidden relative">
      <BackgroundDecorations />
      
      <div className="w-full relative z-10 flex flex-col lg:flex-row gap-12 items-start">
        {/* Left side - Connection Graph + Compliance List */}
        <div className="w-full lg:w-1/2 order-2 lg:order-1 flex flex-col gap-8">
          <div className="hidden lg:flex w-full">
            <ConnectionGraph members={members} />
          </div>
          <MissingWebringComponentList />
        </div>
        
        {/* Right side - Member List */}
        <div className="w-full lg:w-1/2 order-1 lg:order-2">
          <WebringList members={members} />
        </div>
      </div>
    </main>
  );
}

