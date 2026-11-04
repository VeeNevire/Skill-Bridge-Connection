import { Head } from '@inertiajs/react';
import { MotionConfig } from 'motion/react';
import { BentoSection } from '@/components/landing/bento-section';
import { Footer } from '@/components/landing/footer';
import { Hero } from '@/components/landing/hero';
import { Modules } from '@/components/landing/modules';
import { Navbar } from '@/components/landing/navbar';
import { TalentSection } from '@/components/landing/talent-section';
import { Testimonials } from '@/components/landing/testimonials';

export default function Welcome() {
    return (
        <MotionConfig reducedMotion="user">
            <Head title="One Platform, Unlimited Opportunities" />
            <div className="min-h-screen overflow-x-clip bg-surface font-sans text-ink antialiased">
                <Navbar />
                <main>
                    <Hero />
                    <TalentSection />
                    <BentoSection />
                    <Modules />
                    <Testimonials />
                </main>
                <Footer />
            </div>
        </MotionConfig>
    );
}
