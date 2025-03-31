import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';

// Styled components
const HomeContainer = styled.div`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

const HeroSection = styled.div`
  background: linear-gradient(135deg, #4a6fa5 0%, #5e9b8b 100%);
  border-radius: 20px;
  color: white;
  padding: 60px 40px;
  margin-bottom: 60px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  position: relative;
  overflow: hidden;
  
  @media (max-width: 768px) {
    padding: 40px 20px;
  }
`;

const HeroPattern = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  background-image: radial-gradient(rgba(255, 255, 255, 0.1) 2px, transparent 2px);
  background-size: 30px 30px;
  opacity: 0.5;
`;

const HeroTitle = styled(motion.h1)`
  font-size: 3.5rem;
  margin-bottom: 20px;
  line-height: 1.2;
  font-weight: 700;
  
  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const HeroSubtitle = styled(motion.p)`
  font-size: 1.5rem;
  margin-bottom: 40px;
  max-width: 700px;
  line-height: 1.5;
  
  @media (max-width: 768px) {
    font-size: 1.2rem;
  }
`;

const HeroButton = styled(motion(Link))`
  display: inline-block;
  padding: 15px 30px;
  background-color: white;
  color: #4a6fa5;
  font-size: 1.2rem;
  font-weight: 600;
  border-radius: 50px;
  text-decoration: none;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15);
  }
`;

const FeaturesSection = styled.div`
  margin-bottom: 60px;
`;

const SectionTitle = styled.h2`
  text-align: center;
  font-size: 2.5rem;
  margin-bottom: 50px;
  color: #333;
  
  span {
    position: relative;
    
    &::after {
      content: '';
      position: absolute;
      left: 0;
      bottom: -10px;
      width: 100%;
      height: 4px;
      background: linear-gradient(90deg, #4a6fa5 0%, #5e9b8b 100%);
      border-radius: 2px;
    }
  }
`;

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FeatureCard = styled(motion.div)`
  background-color: white;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  
  h3 {
    font-size: 1.5rem;
    margin: 20px 0 15px;
    color: #4a6fa5;
  }
  
  p {
    color: #666;
    line-height: 1.6;
    margin: 0;
  }
`;

const IconContainer = styled.div`
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #4a6fa5 0%, #5e9b8b 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    width: 30px;
    height: 30px;
    color: white;
  }
`;

const WorkflowSection = styled.div`
  margin-bottom: 80px;
`;

const WorkflowSteps = styled.div`
  position: relative;
  max-width: 800px;
  margin: 0 auto;
  
  &::before {
    content: '';
    position: absolute;
    top: 40px;
    bottom: 40px;
    left: 35px;
    width: 4px;
    background: linear-gradient(to bottom, #4a6fa5 0%, #5e9b8b 100%);
    border-radius: 2px;
    
    @media (max-width: 768px) {
      left: 25px;
    }
  }
`;

const WorkflowStep = styled(motion.div)`
  display: flex;
  margin-bottom: 40px;
  position: relative;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const StepNumber = styled.div`
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4a6fa5 0%, #5e9b8b 100%);
  color: white;
  font-size: 1.5rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 30px;
  flex-shrink: 0;
  box-shadow: 0 10px 25px rgba(74, 111, 165, 0.3);
  z-index: 10;
  
  @media (max-width: 768px) {
    width: 50px;
    height: 50px;
    font-size: 1.2rem;
  }
`;

const StepContent = styled.div`
  background-color: white;
  border-radius: 16px;
  padding: 25px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  flex: 1;
  
  h3 {
    color: #4a6fa5;
    margin-top: 0;
    margin-bottom: 15px;
    font-size: 1.4rem;
  }
  
  p {
    color: #666;
    line-height: 1.6;
    margin: 0;
  }
`;

const PromptSection = styled.div`
  background-color: white;
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  margin-bottom: 60px;
  text-align: center;
`;

const PromptTitle = styled.h3`
  font-size: 1.8rem;
  margin-bottom: 20px;
  color: #4a6fa5;
`;

const PromptDescription = styled.p`
  color: #666;
  line-height: 1.6;
  max-width: 800px;
  margin: 0 auto 30px;
`;

const PromptExamples = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20px;
  max-width: 800px;
  margin: 0 auto;
`;

const PromptCard = styled(motion.div)`
  background-color: #f8f9fa;
  border-left: 4px solid #4a6fa5;
  padding: 15px 20px;
  border-radius: 8px;
  text-align: left;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: #f1f3f5;
  }
`;

const PromptText = styled.p`
  margin: 0;
  color: #333;
  font-weight: 500;
`;

const CTASection = styled.div`
  background: linear-gradient(135deg, #4a6fa5 0%, #5e9b8b 100%);
  border-radius: 20px;
  color: white;
  padding: 60px 40px;
  text-align: center;
  margin-bottom: 60px;
  position: relative;
  overflow: hidden;
  
  @media (max-width: 768px) {
    padding: 40px 20px;
  }
`;

const CTATitle = styled.h2`
  font-size: 2.5rem;
  margin-bottom: 20px;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const CTADescription = styled.p`
  font-size: 1.2rem;
  margin-bottom: 30px;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
`;

const CTAButton = styled(motion(Link))`
  display: inline-block;
  padding: 15px 30px;
  background-color: white;
  color: #4a6fa5;
  font-size: 1.2rem;
  font-weight: 600;
  border-radius: 50px;
  text-decoration: none;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15);
  }
`;

// Icons for features
const DiscoverIcon = () => (
  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    <line x1="11" y1="8" x2="11" y2="14"></line>
    <line x1="8" y1="11" x2="14" y2="11"></line>
  </svg>
);

const CustomizeIcon = () => (
  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
  </svg>
);

const CreateIcon = () => (
  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const SaveIcon = () => (
  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
    <polyline points="17 21 17 13 7 13 7 21"></polyline>
    <polyline points="7 3 7 8 15 8"></polyline>
  </svg>
);

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.6,
      ease: "easeOut"
    }
  }
};

const staggerContainer = {
  visible: {
    transition: {
      staggerChildren: 0.2
    }
  }
};

const featureCardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.5,
      ease: "easeOut"
    }
  },
  hover: {
    y: -10,
    transition: { 
      duration: 0.3,
      ease: "easeOut"
    }
  }
};

const workflowStepVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i) => ({ 
    opacity: 1, 
    x: 0, 
    transition: { 
      delay: i * 0.2,
      duration: 0.5,
      ease: "easeOut"
    }
  })
};

const promptCardVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { 
      duration: 0.3
    }
  },
  hover: { 
    scale: 1.05,
    backgroundColor: '#f1f3f5',
    transition: { 
      duration: 0.2 
    }
  }
};

// Sample prompt examples
const promptExamples = [
  "I want to make pasta today",
  "Help me create a low-carb dinner",
  "I have chicken and vegetables, what can I make?",
  "Suggest some vegetarian breakfast ideas",
  "I want to make a fancy dessert for guests",
  "Create a custom pizza recipe"
];

// Main Component
const EnhancedHome = ({ navigate }) => {
  const handlePromptClick = (prompt) => {
    navigate('/chat', { state: { initialMessage: prompt } });
  };
  
  return (
    <HomeContainer>
      <HeroSection>
        <HeroPattern />
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <HeroTitle variants={fadeInUp}>
            Your Personal AI Chef
          </HeroTitle>
          <HeroSubtitle variants={fadeInUp}>
            Discover recipes, customize them to your taste, or create your own unique dishes with the help of our AI culinary assistant.
          </HeroSubtitle>
          <HeroButton 
            to="/chat"
            variants={fadeInUp}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Start Cooking
          </HeroButton>
        </motion.div>
      </HeroSection>
      
      <FeaturesSection>
        <SectionTitle><span>Features</span></SectionTitle>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <FeatureGrid>
            <FeatureCard 
              variants={featureCardVariants}
              whileHover="hover"
            >
              <IconContainer>
                <DiscoverIcon />
              </IconContainer>
              <h3>Discover Recipes</h3>
              <p>Explore a vast collection of recipes from various cuisines. Simply tell the AI what type of dish you're looking for, and it will provide multiple options to choose from.</p>
            </FeatureCard>
            
            <FeatureCard 
              variants={featureCardVariants}
              whileHover="hover"
            >
              <IconContainer>
                <CustomizeIcon />
              </IconContainer>
              <h3>Customize Recipes</h3>
              <p>Adjust ingredients, flavors, and cooking techniques to match your preferences. Want it spicier, healthier, or with a specific ingredient? Just ask!</p>
            </FeatureCard>
            
            <FeatureCard 
              variants={featureCardVariants}
              whileHover="hover"
            >
              <IconContainer>
                <CreateIcon />
              </IconContainer>
              <h3>Create Your Own</h3>
              <p>Build a unique recipe from scratch with step-by-step guidance. The AI will suggest complementary ingredients based on your choices to create the perfect dish.</p>
            </FeatureCard>
            
            <FeatureCard 
              variants={featureCardVariants}
              whileHover="hover"
            >
              <IconContainer>
                <SaveIcon />
              </IconContainer>
              <h3>Save & Share</h3>
              <p>Save your favorite recipes to your personal collection for easy access later. Create a personalized cookbook of dishes tailored to your taste.</p>
            </FeatureCard>
          </FeatureGrid>
        </motion.div>
      </FeaturesSection>
      
      <WorkflowSection>
        <SectionTitle><span>How It Works</span></SectionTitle>
        <WorkflowSteps>
          <WorkflowStep 
            custom={0}
            initial="hidden"
            animate="visible"
            variants={workflowStepVariants}
          >
            <StepNumber>1</StepNumber>
            <StepContent>
              <h3>Tell us what you want to cook</h3>
              <p>Start by describing what type of dish you'd like to make. You can be specific ("spaghetti carbonara") or general ("Italian dinner"). The AI will provide multiple options based on your request.</p>
            </StepContent>
          </WorkflowStep>
          
          <WorkflowStep 
            custom={1}
            initial="hidden"
            animate="visible"
            variants={workflowStepVariants}
          >
            <StepNumber>2</StepNumber>
            <StepContent>
              <h3>Choose a recipe or create your own</h3>
              <p>Select one of the suggested recipes or choose to create a custom dish. For custom recipes, the AI will guide you through selecting nutritional targets, main ingredients, and cooking methods.</p>
            </StepContent>
          </WorkflowStep>
          
          <WorkflowStep 
            custom={2}
            initial="hidden"
            animate="visible"
            variants={workflowStepVariants}
          >
            <StepNumber>3</StepNumber>
            <StepContent>
              <h3>Customize to your preference</h3>
              <p>Adjust the recipe by specifying changes like "make it spicier" or "use less salt." The AI will modify the recipe while maintaining the dish's integrity and flavor balance.</p>
            </StepContent>
          </WorkflowStep>
          
          <WorkflowStep 
            custom={3}
            initial="hidden"
            animate="visible"
            variants={workflowStepVariants}
          >
            <StepNumber>4</StepNumber>
            <StepContent>
              <h3>Get detailed instructions</h3>
              <p>Receive complete ingredients list, step-by-step cooking instructions, and nutritional information. The AI provides everything you need to prepare the perfect dish.</p>
            </StepContent>
          </WorkflowStep>
          
          <WorkflowStep 
            custom={4}
            initial="hidden"
            animate="visible"
            variants={workflowStepVariants}
          >
            <StepNumber>5</StepNumber>
            <StepContent>
              <h3>Save your favorites</h3>
              <p>Save recipes you love to your personal collection for easy access later. Build your own digital cookbook filled with personalized recipes.</p>
            </StepContent>
          </WorkflowStep>
        </WorkflowSteps>
      </WorkflowSection>
      
      <PromptSection>
        <PromptTitle>Try These Example Prompts</PromptTitle>
        <PromptDescription>
          Get started with some of these example conversations to see what the AI culinary assistant can do for you.
        </PromptDescription>
        <PromptExamples>
          {promptExamples.map((prompt, index) => (
            <PromptCard 
              key={index}
              onClick={() => handlePromptClick(prompt)}
              variants={promptCardVariants}
              initial="hidden"
              animate="visible"
              whileHover="hover"
              whileTap={{ scale: 0.95 }}
            >
              <PromptText>"{prompt}"</PromptText>
            </PromptCard>
          ))}
        </PromptExamples>
      </PromptSection>
      
      <CTASection>
        <HeroPattern />
        <CTATitle>Ready to Start Cooking?</CTATitle>
        <CTADescription>
          Begin your culinary journey with our AI assistant and discover a world of delicious possibilities.
        </CTADescription>
        <CTAButton 
          to="/chat"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Chat with AI Chef
        </CTAButton>
      </CTASection>
    </HomeContainer>
  );
};

export default EnhancedHome;