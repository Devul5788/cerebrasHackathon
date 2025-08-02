const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Connect to MongoDB
mongoose.connect(process.env.DATABASE_URL || 'mongodb://localhost:27017/b2b-outreach', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Define schemas
const companyProfileSchema = new mongoose.Schema({
  name: String,
  industry: String,
  size: String,
  description: String,
  website: String,
  createdAt: { type: Date, default: Date.now },
});

const productProfileSchema = new mongoose.Schema({
  name: String,
  description: String,
  features: [String],
  targetIndustries: [String],
  createdAt: { type: Date, default: Date.now },
});

const customerCompanySchema = new mongoose.Schema({
  name: String,
  industry: String,
  size: String,
  description: String,
  website: String,
  fitReason: String,
  employees: [{
    name: String,
    role: String,
    profilePicture: String,
    linkedinUrl: String,
  }],
  createdAt: { type: Date, default: Date.now },
});

const CompanyProfile = mongoose.model('CompanyProfile', companyProfileSchema);
const ProductProfile = mongoose.model('ProductProfile', productProfileSchema);
const CustomerCompany = mongoose.model('CustomerCompany', customerCompanySchema);

// Routes
app.get('/', (req, res) => {
  res.send('B2B Outreach Automation API');
});

// Chatbot routes
app.post('/api/chatbot/company', async (req, res) => {
  try {
    const { name, industry, size, description, website } = req.body;
    const companyProfile = new CompanyProfile({
      name,
      industry,
      size,
      description,
      website,
    });
    await companyProfile.save();
    res.json({ success: true, data: companyProfile });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/chatbot/product', async (req, res) => {
  try {
    const { name, description, features, targetIndustries } = req.body;
    const productProfile = new ProductProfile({
      name,
      description,
      features,
      targetIndustries,
    });
    await productProfile.save();
    res.json({ success: true, data: productProfile });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/chatbot/generate-customers', async (req, res) => {
  try {
    // In a real implementation, this would use AI to generate customer companies
    // For now, we'll return sample data
    const sampleCustomers = [
      {
        name: "Tech Solutions Inc.",
        industry: "Technology",
        size: "500-1000 employees",
        description: "A leading provider of enterprise software solutions specializing in cloud infrastructure and data analytics.",
        website: "https://techsolutions.com",
        fitReason: "Strong alignment with your software products and similar target market."
      },
      {
        name: "Global Innovations Ltd.",
        industry: "Technology",
        size: "1000+ employees",
        description: "Multinational technology company focused on AI-driven business solutions and digital transformation services.",
        website: "https://globalinnovations.com",
        fitReason: "Large enterprise with significant budget for technology solutions matching your product offerings."
      },
      {
        name: "Future Enterprises",
        industry: "Consulting",
        size: "50-100 employees",
        description: "Business consulting firm helping companies optimize operations and implement new technologies.",
        website: "https://futureenterprises.com",
        fitReason: "Consulting firms often need your type of software to enhance their service offerings to clients."
      }
    ];
    
    res.json({ success: true, data: sampleCustomers });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Inbox routes
app.get('/api/inbox/companies', async (req, res) => {
  try {
    // In a real implementation, this would fetch from database
    // For now, we'll return sample data
    const sampleCompanies = [
      {
        id: 1,
        name: "Tech Solutions Inc.",
        industry: "Technology",
        lastContacted: "2025-07-28",
        unreadMessages: 2,
      },
      {
        id: 2,
        name: "Global Innovations Ltd.",
        industry: "Technology",
        lastContacted: "2025-07-30",
        unreadMessages: 0,
      },
      {
        id: 3,
        name: "Future Enterprises",
        industry: "Consulting",
        lastContacted: "2025-07-25",
        unreadMessages: 1,
      }
    ];
    
    res.json({ success: true, data: sampleCompanies });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/inbox/company/:id', async (req, res) => {
  try {
    const companyId = req.params.id;
    
    // In a real implementation, this would fetch from database
    // For now, we'll return sample data
    const companyDetails = {
      id: companyId,
      name: "Tech Solutions Inc.",
      industry: "Technology",
      size: "500-1000 employees",
      description: "A leading provider of enterprise software solutions specializing in cloud infrastructure and data analytics.",
      website: "https://techsolutions.com",
      fitReason: "Strong alignment with your software products and similar target market.",
    };
    
    const potentialClients = [
      {
        id: 1,
        name: "John Smith",
        role: "CTO",
        profilePicture: "https://via.placeholder.com/50",
        linkedinUrl: "https://linkedin.com/in/johnsmith",
      },
      {
        id: 2,
        name: "Sarah Johnson",
        role: "Product Manager",
        profilePicture: "https://via.placeholder.com/50",
        linkedinUrl: "https://linkedin.com/in/sarahjohnson",
      },
      {
        id: 3,
        name: "Michael Lee",
        role: "Sales Director",
        profilePicture: "https://via.placeholder.com/50",
        linkedinUrl: "https://linkedin.com/in/michaellee",
      }
    ];
    
    res.json({ 
      success: true, 
      data: { 
        company: companyDetails,
        clients: potentialClients
      } 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/inbox/templates/:role', async (req, res) => {
  try {
    const role = req.params.role;
    
    // In a real implementation, this would fetch from database
    // For now, we'll return sample templates based on role
    const templates = {
      "CTO": {
        subject: "Technical Partnership Opportunity for Tech Solutions Inc.",
        body: "Dear {{name}},\\n\\nI hope this message finds you well. I'm reaching out because we've identified Tech Solutions Inc. as a potential strategic partner for our cutting-edge software solutions.\\n\\nAs CTO, you're likely always looking for ways to enhance your technical capabilities and infrastructure. Our platform offers advanced features that could complement your current technology stack.\\n\\nWould you be interested in scheduling a brief technical discussion to explore potential synergies?\\n\\nBest regards,\\n{{userCompanyName}}"
      },
      "Product Manager": {
        subject: "Enhance Your Product Management with Our Solutions",
        body: "Hi {{name}},\\n\\nI wanted to connect with you regarding our software solutions that could help streamline product development at Tech Solutions Inc.\\n\\nOur platform has features that many product managers find valuable for tracking development progress and gathering user insights.\\n\\nI'd love to show you a quick demo of how our solution could benefit your team. Are you available for a 15-minute call next week?\\n\\nThanks,\\n{{userCompanyName}}"
      },
      "Sales Director": {
        subject: "New Tool to Boost Your Sales Team's Performance",
        body: "Hello {{name}},\\n\\nI'm contacting you about our software solution that could significantly enhance your sales team's effectiveness.\\n\\nWe've helped companies similar to Tech Solutions Inc. increase their conversion rates by 30% through our automated outreach platform.\\n\\nI'd be happy to schedule a brief meeting to discuss how we can support your sales objectives.\\n\\nLooking forward to connecting,\\n{{userCompanyName}}"
      },
      "default": {
        subject: "Partnership Opportunity with {{userCompanyName}}",
        body: "Hello {{name}},\\n\\nI'm reaching out from {{userCompanyName}} to explore potential partnership opportunities.\\n\\nWe believe our companies could benefit from collaboration, and I'd like to discuss how we can work together.\\n\\nAre you available for a brief conversation?\\n\\nBest regards,\\n{{userCompanyName}}"
      }
    };
    
    const template = templates[role] || templates["default"];
    res.json({ success: true, data: template });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
