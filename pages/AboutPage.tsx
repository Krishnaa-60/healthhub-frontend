import React from 'react';
import InstagramIcon from '../components/icons/InstagramIcon';
import LinkedinIcon from '../components/icons/LinkedinIcon';
import PersonIcon from '../components/icons/PersonIcon';
import MailIcon from '../components/icons/MailIcon';
import UserPlaceholderIcon from '../components/icons/UserPlaceholderIcon';


const socialLinks = {
  instagram: "https://www.instagram.com/mr.mystery_182?igsh=MThla2tpdndhMW9sZQ==",
  linkedin: "http://www.linkedin.com/in/",
};

const developers = [
  {
    name: 'Krishna',
    email: 'krishnaa999k@gmail.com',
    imageUrl: '/assets/krishna.png',
  },
  {
    name: 'Ishwarya',
    email: 'ishwarya12@gmail.com',
    imageUrl: '/assets/ishwarya.png',
  },
  {
    name: 'Harshitha',
    email: 'Harshitha12@gmail.com',
    imageUrl: '/assets/harshitha.png',
  },
  {
    name: 'Madhu',
    email: 'Madhu12@gmail.com',
    imageUrl: '/assets/madhu.png',
  },
  {
    name: 'Sumanth',
    email: 'sumanth12@gmail.com',
    imageUrl: '/assets/sumanth.png',
  },
  {
    name: 'Rajesh',
    email: 'rajesh12@gmail.com',
    imageUrl: '/assets/rajesh.png',
  },
  {
    name: 'Chandini',
    email: 'chandini12@gmail.com',
    imageUrl: '/assets/chandini.png',
  },
];

const SocialLink: React.FC<{ href: string; children: React.ReactNode; className?: string }> = ({ href, children, className }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" className={`w-10 h-10 rounded-full flex items-center justify-center text-white shadow-md transform transition-transform hover:scale-110 ${className}`}>
    {children}
  </a>
);

const DeveloperCard: React.FC<{ developer: typeof developers[0] }> = ({ developer }) => (
  <div className="bg-white/80 dark:bg-dark-card/80 rounded-2xl p-6 text-center flex flex-col items-center shadow-lg border border-white/30 dark:border-dark-subtext/20 transition-all duration-300 hover:shadow-xl w-full sm:w-72 transform hover:-translate-y-1">
    <div className="w-32 h-32 rounded-full mb-4 bg-gradient-to-br from-green-100 to-teal-100 dark:from-dark-bg dark:to-dark-card border-4 border-white/50 dark:border-dark-subtext/20 shadow-md flex items-center justify-center overflow-hidden">
      {developer.imageUrl ? (
        <img src={developer.imageUrl} alt={developer.name} className="w-full h-full object-cover" />
      ) : (
        <UserPlaceholderIcon className="w-24 h-24" />
      )}
    </div>
    <div className="flex items-center font-semibold text-gray-800 dark:text-dark-text text-lg">
      <PersonIcon className="w-5 h-5 mr-2" />
      <h3>{developer.name}</h3>
    </div>
    <div className="flex items-center text-gray-600 dark:text-dark-subtext text-sm mt-1">
      <MailIcon className="w-4 h-4 mr-2" />
      <p>{developer.email}</p>
    </div>
    <div className="flex space-x-4 mt-4 pt-4 border-t border-gray-200 dark:border-dark-subtext/20 w-full justify-center">
      <SocialLink href={socialLinks.instagram} className="bg-gradient-to-br from-yellow-400 via-red-500 to-purple-600">
        <InstagramIcon className="w-6 h-6" />
      </SocialLink>
      <SocialLink href={`mailto:${developer.email}`} className="bg-orange-500">
        <MailIcon className="w-6 h-6" />
      </SocialLink>
      <SocialLink href={socialLinks.linkedin} className="bg-blue-600">
        <LinkedinIcon className="w-6 h-6" />
      </SocialLink>
    </div>
  </div>
);


const AboutPage: React.FC = () => {
    return (
        <div className="w-full flex-grow flex items-center justify-center p-4 sm:p-8 bg-gradient-to-r from-green-200 via-teal-200 to-cyan-300 dark:bg-gradient-to-r dark:from-gray-700 dark:via-gray-900 dark:to-black relative overflow-hidden">
            {/* Decorative shapes */}
            <div className="absolute top-10 left-20 w-32 h-32 bg-white/20 dark:bg-white/5 rounded-full transform rotate-45 animate-pulse"></div>
            <div className="absolute bottom-10 right-20 w-40 h-40 bg-white/20 dark:bg-white/5 rounded-xl transform -rotate-12 animate-pulse delay-150"></div>
            <div className="absolute top-1/2 right-1/4 w-24 h-24 bg-white/20 dark:bg-white/5 rounded-full animate-pulse delay-75"></div>
            <span className="absolute top-1/4 right-1/3 text-8xl text-white/10 font-black select-none">+</span>
            <span className="absolute bottom-1/3 left-1/4 text-8xl text-white/10 font-black select-none">+</span>

            <main className="w-full max-w-6xl bg-white/30 dark:bg-dark-card/30 backdrop-blur-xl rounded-3xl shadow-2xl p-10 border border-white/40 dark:border-dark-subtext/20 z-10 text-center">
                <h1 className="text-4xl font-black text-gray-800 dark:text-dark-text mb-4">Behind Healthhub</h1>
                
                {/* Our Mission Section */}
                <div className="max-w-3xl mx-auto mb-12">
                    <h2 className="text-3xl font-bold text-primary-green dark:text-dark-accent mb-4">Our Mission</h2>
                    <p className="text-lg text-gray-700 dark:text-dark-subtext leading-relaxed">
                        To empower individuals to take control of their health journey by providing a secure, intuitive, and comprehensive personal health management system. We believe in making healthcare accessible and manageable for everyone, connecting patients, doctors, and administrators on a single, seamless platform.
                    </p>
                </div>

                <p className="text-2xl font-bold text-gray-500 dark:text-dark-subtext mb-2">-- Meet the Team --</p>
                <p className="text-black dark:text-dark-text mb-8">(Developers)</p>
                
                <div className="flex flex-col items-center gap-8">
                  {/* First row: 1 person */}
                  {developers.length > 0 && (
                    <div className="flex justify-center">
                       <DeveloperCard developer={developers[0]} />
                    </div>
                  )}

                  {/* Second row: 3 people */}
                  {developers.length > 1 && (
                    <div className="flex flex-wrap justify-center gap-8">
                      {developers.slice(1, 4).map((dev) => (
                        <DeveloperCard key={dev.name} developer={dev} />
                      ))}
                    </div>
                  )}

                   {/* Third row: 3 people */}
                  {developers.length > 4 && (
                    <div className="flex flex-wrap justify-center gap-8">
                      {developers.slice(4, 7).map((dev) => (
                        <DeveloperCard key={dev.name} developer={dev} />
                      ))}
                    </div>
                  )}
                </div>
            </main>
        </div>
    );
}

export default AboutPage;