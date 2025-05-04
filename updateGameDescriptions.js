const mongoose = require('mongoose');
const Game = require('./models/Game');


const gameTranslations = {
  'Yeraltı dünyasından kaçış.': 'Escape from the underworld.',
  'Yaratıcılığın sınır tanımadığı dünya.': 'A world where creativity knows no bounds.',
  'Kratos\'un Norveç macerası.': 'Kratos\'s adventure in Norway.',
  
  'RPG klasiklerinden biri.': 'One of the RPG classics.',
  'Vahşi Batı\'da geçen epik bir hikaye.': 'An epic story set in the Wild West.',
  'Post-apokaliptik bir dünyada hayatta kalma.': 'Survival in a post-apocalyptic world.',
  'Uzay keşif macerası.': 'A space exploration adventure.',
  'Fantastik bir dünyada strateji savaşları.': 'Strategy battles in a fantastic world.',
  'Modern savaş simülasyonu.': 'Modern warfare simulation.',
  'Korku ve gerilimin doruğu.': 'The pinnacle of horror and suspense.',
  'Bulmaca odaklı platform oyunu.': 'A puzzle-focused platform game.',
  'Suç dünyasının en derinlerine yolculuk.': 'A journey into the depths of the criminal world.',
  'Bir futbol simülasyonu.': 'A football simulation.',
  'Hız ve yarış tutkunları için.': 'For speed and racing enthusiasts.',
  'Aksiyon dolu spor simülasyonu.': 'Action-packed sports simulation.',
  'Zombi kıyameti sonrası hayatta kalma.': 'Post-zombie apocalypse survival.',
  'Doğal yaşamı keşfet.': 'Explore the natural world.',
  'Orta çağda geçen strateji oyunu.': 'A strategy game set in the Middle Ages.',
  'Antik uygarlıkları yönet.': 'Manage ancient civilizations.',
  'Büyülü bir dünyada macera.': 'Adventure in a magical world.',
  'Uzay gemisiyle galaksileri keşfet.': 'Explore galaxies with your spaceship.',
  'Sürükleyici bir suç hikayesi.': 'An immersive crime story.',
  'Dijital dünyada hayatta kalma.': 'Survival in a digital world.',
  'Fantastik savaşlar ve büyüler.': 'Fantastic battles and magic.',
  'Sanal dünyada hayat simülasyonu.': 'Life simulation in a virtual world.',
  
  'Zorlu düşmanlar ve geniş bir dünya.': 'Challenging enemies and a vast world.',
  'Makinelerin hükmettiği bir dünya.': 'A world ruled by machines.',
  'Unutulmuş Diyarlar\'da bir macera.': 'An adventure in the Forgotten Realms.',
  'Zeka zorlayan bulmacalar ve mizah.': 'Mind-bending puzzles and humor.',
  'Galaksiyi kurtarma görevi.': 'A mission to save the galaxy.',
  'An epic story set in the Wild West.': 'An epic story set in the Wild West.' // Already in English
};

async function updateGameDescriptions() {
  try {
    
    await mongoose.connect('mongodb://localhost:27017/gameDistribution');
    console.log('Connected to MongoDB');
    
    
    const games = await Game.find();
    console.log(`Found ${games.length} games`);
    
    
    for (const game of games) {
      const turkishDescription = game.description;
      
      if (turkishDescription && gameTranslations[turkishDescription]) {
        console.log(`Updating description for ${game.name}`);
        console.log(`  From: ${turkishDescription}`);
        console.log(`  To:   ${gameTranslations[turkishDescription]}`);
        
        game.description = gameTranslations[turkishDescription];
        await game.save();
        console.log(`  Updated successfully`);
      } else {
        console.log(`No translation needed for ${game.name}`);
      }
    }
    
    console.log('All game descriptions updated successfully');
  } catch (error) {
    console.error('Error updating game descriptions:', error);
  } finally {
   
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}


updateGameDescriptions(); 