/**
 * Features Section Component
 * Display key features of the application
 */

import { motion } from 'framer-motion';
import { FEATURES } from '../../config/constants';

const FeaturesSection = () => {
  return (
    <section className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {FEATURES.map((feature, index) => (
            <motion.div
              key={index}
              className="p-8 bg-primary/5 dark:bg-primary/10 border border-primary/10 dark:border-primary/20 rounded-xl hover:bg-primary/20 transition-colors"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
            >
              <div className="text-accent mb-4">
                <span className="material-icons-round text-3xl">{feature.icon}</span>
              </div>
              <h4 className="text-xl font-bold mb-3">{feature.title}</h4>
              <p className="text-slate-400 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
