// import Game from '@/components/game'

// export default function HomePage() {
//   return (
//     <main>
//       <Game/>
//     </main>
//   )
// }

import Head from 'next/head';
// import Game from '@/components/game';
import GameStartPage from '@/components/welcome';

export default function HomePage() {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <main>
        <GameStartPage />
      </main>
    </>
  );
}
