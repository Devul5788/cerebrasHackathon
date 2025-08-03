# CerebrasApp - AI-Powered Sales Outreach Platform

An intelligent full-stack sales outreach platform built with **React + TypeScript + Tailwind CSS** frontend and **Django + Django REST Framework** backend. This platform automates the entire sales process from company discovery to personalized email outreach using Cerebras' cutting-edge AI infrastructure capabilities.

## 🧠 Cerebras AI Solutions Integration

This platform is designed to help sales teams identify and engage prospects for Cerebras' comprehensive AI computing solutions:

### 🚀 **Cerebras Product Portfolio**

#### **1. Cerebras AI Inference**
- **Category**: AI Inference Solution
- **Key Features**: 
  - Real-time, low-latency performance for generative AI
  - High throughput for concurrent users
  - Native hardware acceleration for sparse models
  - Eliminates external memory bottlenecks
- **Use Cases**: Interactive AI applications, chatbots, live translation, AI co-pilots
- **Target Customers**: Enterprise API endpoints, real-time applications

#### **2. Cerebras Condor Galaxy**
- **Category**: AI Supercomputer Cloud Service (36 ExaFLOPs total capacity)
- **Key Features**:
  - Federated network of AI supercomputers
  - Supports models with 600B+ parameters
  - Cloud pay-per-use model
  - Reduces infrastructure complexity
- **Use Cases**: Training massive AI models, enterprise research labs
- **Target Customers**: AI startups, research institutions, large enterprises

#### **3. Cerebras Inference API**
- **Category**: Cloud-based Inference Access
- **Key Features**:
  - OpenAI API compatibility for seamless migration
  - Ultra-high token generation rates
  - Developer-friendly integration
- **Use Cases**: Real-time AI responses, code generation, summarization
- **Target Customers**: Developers, software companies, AI-powered applications

#### **4. Cerebras Model Hosting / AI Model Studio**
- **Category**: Managed Model Training & Hosting Service
- **Key Features**:
  - Dedicated cluster training and hosting
  - Simplified distributed computing
  - Pay-per-model or dedicated access
- **Use Cases**: Custom model development, rapid iteration, secure training
- **Target Customers**: Enterprises with proprietary models, research teams

#### **5. Cerebras Datacenter Rental**
- **Category**: Dedicated AI Compute Infrastructure
- **Key Features**:
  - Private cloud environment with CS-3 systems
  - Full model and data ownership
  - Sustained high-performance computing
- **Use Cases**: Continuous AI workloads, data privacy requirements
- **Target Customers**: Large enterprises, government agencies, research institutions

#### **6. Cerebras Datacenter Sales (On-Premises)**
- **Category**: AI Supercomputer System Sales
- **Key Features**:
  - CS-3 systems for on-premises deployment
  - Complete infrastructure control
  - Rapid deployment and integration
- **Use Cases**: Private AI clouds, HPC environments, specialized research
- **Target Customers**: Pharmaceutical companies, national labs, energy companies

### 🎯 **Target Industries & Use Cases**

#### **Technology & AI Companies**
- **Current Customers**: Perplexity, Mistral AI, Meta, Andrew Ng (DeepLearning.AI)
- **Use Cases**: LLM training, inference acceleration, model hosting
- **Value Proposition**: Faster training times, reduced costs, architectural diversity

#### **Financial Services**
- **Target Companies**: JPMorgan Chase, Goldman Sachs, BlackRock
- **Use Cases**: Fraud detection, risk modeling, trading algorithms
- **Value Proposition**: Real-time processing, regulatory compliance, secure infrastructure

#### **Healthcare & Biotech**
- **Current Customers**: Mayo Clinic, Memorial Sloan Kettering
- **Use Cases**: Medical imaging, genomics, drug discovery
- **Value Proposition**: Accelerated research cycles, complex modeling capabilities

#### **Enterprise & Cloud Providers**
- **Target Companies**: IBM, Microsoft, Google, Amazon
- **Use Cases**: Large-scale model training, cloud service acceleration
- **Value Proposition**: Performance gains, differentiated AI offerings

## 🚀 Platform Features

### 🤖 **Part 1 - Interactive AI Chatbot (Profile Setup)**
- **Company Profile Generation**: Auto-fill company details using external APIs (Clearbit, Crunchbase, LinkedIn)
- **Product Profile Database**: AI-suggested products/services based on company profile
- **Customer Company Discovery**: AI-powered target company identification with buying intent signals
- **Cerebras Fit Analysis**: Automated assessment of customer fit for specific Cerebras solutions

### 📧 **Part 2 - Sales Outreach Workspace**
- **Inbox-Style UI**: Outlook/Gmail-like interface for managing prospects
- **Contact Discovery**: Automated contact finding with role detection (decision-makers, buyers)
- **AI Email Generation**: Personalized email pitches with Cerebras solution recommendations
- **Email Integration**: Direct sending through Outlook/Gmail APIs with tracking
- **Customer Reporting**: Comprehensive reports combining Cerebras offerings with customer data

### 🎯 **Cerebras-Specific Intelligence**
- **Product Matching**: Automatically matches prospects to optimal Cerebras solutions
- **Technical Fit Scoring**: AI-powered scoring (1-10) based on customer AI/ML infrastructure
- **Value Proposition Generation**: Custom value props leveraging Cerebras offerings data
- **Use Case Identification**: Maps customer needs to specific Cerebras capabilities
- **Competitive Analysis**: Positions Cerebras solutions against current customer infrastructure

## 🛠️ Technical Stack

- **Frontend**: React 18 with TypeScript and Tailwind CSS
- **Backend**: Django 4.2 with Django REST Framework + Celery for background tasks
- **AI Models**: GPT-based text generation, semantic search, entity recognition
- **Integrations**: Clearbit, Crunchbase, Apollo.io, LinkedIn API, Microsoft Graph, Gmail API
- **Database**: PostgreSQL (structured profiles), Redis (session management)
- **Styling**: Modern, responsive design with Tailwind CSS
- **Type Safety**: Full TypeScript integration across the stack

## 📁 Project Structure

```
cerebrasHackathon/
├── frontend/                    # React + TypeScript + Tailwind CSS
│   ├── src/
│   │   ├── api/                # API services organized by Django apps
│   │   │   ├── onboardingActions.ts      # Company & product profile setup
│   │   │   ├── companiesActions.ts       # Company management operations  
│   │   │   ├── contactsActions.ts        # Contact discovery & management
│   │   │   ├── outreachActions.ts        # Email generation & campaigns
│   │   │   ├── integrationsActions.ts    # External API integrations
│   │   │   ├── aiServicesActions.ts      # AI/ML processing services
│   │   │   ├── base.ts                   # Base API service class
│   │   │   ├── types.ts                  # TypeScript interfaces
│   │   │   └── hooks.ts                  # Custom React hooks
│   │   ├── components/         # Organized UI components
│   │   │   ├── ui/                       # Basic UI components
│   │   │   │   ├── LoadingSpinner.tsx
│   │   │   │   └── ErrorDisplay.tsx
│   │   │   ├── layout/                   # Layout components
│   │   │   │   └── Header.tsx
│   │   │   ├── forms/                    # Form components
│   │   │   │   └── DataCard.tsx
│   │   │   ├── chatbot/                  # AI chatbot interface
│   │   │   ├── contacts/                 # Contact management UI
│   │   │   ├── inbox/                    # Email inbox interface
│   │   │   └── outreach/                 # Outreach campaign UI
│   │   ├── pages/              # Page components by user flow
│   │   │   ├── auth/                     # Authentication pages
│   │   │   │   ├── login/
│   │   │   │   ├── register/
│   │   │   │   └── profile/
│   │   │   ├── onboarding/               # Onboarding flow pages
│   │   │   │   ├── chatbot/              # AI chatbot interface
│   │   │   │   ├── company-setup/        # Company profile setup
│   │   │   │   └── product-setup/        # Product profile setup
│   │   │   ├── workspace/                # Main workspace pages
│   │   │   │   ├── inbox/                # Sales outreach inbox
│   │   │   │   ├── company-research/     # Company analysis
│   │   │   │   └── contact-discovery/    # Contact finder
│   │   │   └── HomePage.tsx              # Landing page
│   │   ├── routers/            # Navigation and routing
│   │   └── assets/             # Static assets
│   └── package.json
├── backend/                    # Django + DRF with specialized apps
│   ├── onboarding/            # 🤖 Onboarding app
│   │   ├── models/            # Database models
│   │   │   ├── __init__.py
│   │   │   └── OnboardingStep.py         # User progress tracking
│   │   ├── services/          # Business logic layer
│   │   │   ├── __init__.py
│   │   │   └── onboarding_service.py     # Onboarding flow logic
│   │   ├── migrations/        # Database migrations
│   │   ├── views.py           # API endpoints for profile setup
│   │   ├── urls.py            # URL routing for onboarding
│   │   ├── tasks.py           # Background tasks (company enrichment)
│   │   ├── tests.py           # Unit tests
│   │   └── admin.py           # Django admin integration
│   ├── companies/             # 🏢 Company management app
│   │   ├── models/            # Company profile models
│   │   ├── services/          # Company data processing
│   │   ├── views.py           # Company CRUD operations
│   │   ├── tasks.py           # Company research tasks
│   │   └── ...
│   ├── contacts/              # 👥 Contact discovery app
│   │   ├── models/            # Contact and role models
│   │   ├── services/          # Contact scraping & discovery
│   │   ├── views.py           # Contact management APIs
│   │   ├── tasks.py           # Contact enrichment tasks
│   │   └── ...
│   ├── outreach/              # 📧 Email outreach app
│   │   ├── models/            # Email templates & campaigns
│   │   ├── services/          # Email generation & sending
│   │   ├── views.py           # Outreach management APIs
│   │   ├── tasks.py           # Email sending tasks
│   │   └── ...
│   ├── integrations/          # 🔌 External API integrations app
│   │   ├── models/            # Integration configurations
│   │   ├── services/          # API connectors (Clearbit, Crunchbase, etc.)
│   │   ├── views.py           # Integration management APIs
│   │   ├── tasks.py           # Data sync tasks
│   │   └── ...
│   ├── ai_services/           # 🧠 AI/ML processing app
│   │   ├── models/            # AI model configurations
│   │   ├── services/          # AI processing services
│   │   ├── views.py           # AI processing APIs
│   │   ├── tasks.py           # ML processing tasks
│   │   └── ...
│   ├── api/                   # 🔗 Legacy API app (to be deprecated)
│   ├── project/               # 🚀 Main Django project
│   │   ├── settings.py        # Django configuration
│   │   ├── urls.py            # Main URL routing
│   │   └── ...
│   ├── manage.py
│   └── requirements.txt
├── start-app.bat              # One-click setup script (Windows)
├── start-app.sh               # One-click setup script (Mac/Linux)
└── README.md
```

## 🏗️ Architecture Overview

### Frontend Architecture (React + TypeScript)

The frontend is organized around the user journey and feature domains:

#### **📁 API Services Layer (`/src/api/`)**
Each API service file corresponds to a Django app, providing clean separation:

- **`onboardingActions.ts`** - Handles company search, profile creation, and onboarding flow
- **`companiesActions.ts`** - Company management, research, and analysis operations
- **`contactsActions.ts`** - Contact discovery, role detection, and contact management
- **`outreachActions.ts`** - Email template generation, campaign management, and sending
- **`integrationsActions.ts`** - External API integrations (Clearbit, Crunchbase, LinkedIn)
- **`aiServicesActions.ts`** - AI/ML processing for text generation and semantic search

#### **📁 Component Organization (`/src/components/`)**
Components are grouped by functionality rather than type:

- **`ui/`** - Reusable UI primitives (buttons, modals, spinners)
- **`layout/`** - Page layout and navigation components
- **`forms/`** - Form components and input handling
- **`chatbot/`** - AI chatbot interface components
- **`contacts/`** - Contact management and display components
- **`inbox/`** - Email inbox and threading components  
- **`outreach/`** - Campaign creation and email composition

#### **📁 Page Structure (`/src/pages/`)**
Pages follow the user journey flow:

- **`auth/`** - User authentication and profile management
- **`onboarding/`** - Step-by-step setup process (company → products → customers)
- **`workspace/`** - Main application workspace for sales activities

### Backend Architecture (Django + DRF)

The backend uses Django apps to separate business domains:

#### **🤖 Onboarding App**
**Purpose**: Manages the initial user and company setup process
- **Models**: `OnboardingStep` (progress tracking), `CompanyProfile`, `ProductProfile`
- **Services**: Company data enrichment, product suggestion AI, flow management
- **Tasks**: Background company research, external API data fetching
- **APIs**: Company search, profile CRUD, onboarding step management

#### **🏢 Companies App**  
**Purpose**: Handles company data management and research
- **Models**: `Company`, `CompanyAnalysis`, `MarketResearch`, `SalesSignal`
- **Services**: Company research, market analysis, competitor identification
- **Tasks**: Periodic data updates, news monitoring, funding tracking
- **APIs**: Company CRUD, research data, market insights

#### **👥 Contacts App**
**Purpose**: Contact discovery and relationship management
- **Models**: `Contact`, `ContactRole`, `CompanyHierarchy`, `ContactSource`
- **Services**: Contact scraping, role detection, org chart building
- **Tasks**: Contact enrichment, social profile gathering, email verification
- **APIs**: Contact discovery, role filtering, contact management

#### **📧 Outreach App**
**Purpose**: Email generation and campaign management
- **Models**: `EmailTemplate`, `Campaign`, `EmailOutreach`, `EmailTracking`
- **Services**: AI email generation, personalization, tone adaptation
- **Tasks**: Email sending, delivery tracking, response monitoring
- **APIs**: Template management, campaign creation, send tracking

#### **🔌 Integrations App**
**Purpose**: External API connections and data synchronization
- **Models**: `APIConfig`, `DataSource`, `SyncLog`, `RateLimit`
- **Services**: Clearbit, Crunchbase, Apollo.io, LinkedIn connectors
- **Tasks**: Data synchronization, API rate limiting, credential management
- **APIs**: Integration status, data refresh, API health checks

#### **🧠 AI Services App**
**Purpose**: AI/ML processing and model management
- **Models**: `AIModel`, `ProcessingJob`, `ModelConfig`, `AIResponse`
- **Services**: Text generation, semantic search, entity extraction
- **Tasks**: Model inference, batch processing, model fine-tuning
- **APIs**: AI processing requests, model status, training jobs

## 🔄 User Flow & Data Pipeline

### **Phase 1: Onboarding & Profile Setup**
1. **Company Discovery** (`onboarding` app)
   - User enters company name → AI searches external APIs → Auto-fills company details
   - Fallback: Conversational chatbot collects missing information

2. **Product Profiling** (`onboarding` app) 
   - AI suggests products based on company profile → User selects/customizes
   - Stores product metadata for later matching

3. **Customer Discovery** (`companies` + `contacts` apps)
   - AI identifies target companies using company + product profiles
   - Filters by industry, size, geography, buying signals
   - **Cerebras Integration**: Matches prospects to Cerebras offerings using `company_offerings.json`

### **Phase 2: Sales Workspace & Outreach**
4. **Company Research** (`companies` app)
   - Automated market research and fit analysis using Perplexity API
   - **Cerebras Fit Analysis**: AI scores customer fit (1-10) for each Cerebras solution
   - News monitoring, funding rounds, hiring trends

5. **Contact Discovery** (`contacts` app)
   - Scrapes/APIs for decision-makers at target companies
   - Role detection and org chart building
   - **Enhanced Email Generation**: Professional email formats (firstname.lastname@company.com)

6. **Email Generation** (`outreach` app)
   - AI generates personalized emails using Cerebras solution data
   - **Solution-Specific Messaging**: Tailored value propositions per Cerebras product
   - Tone adaptation based on contact role and seniority

7. **Campaign Execution** (`outreach` + `integrations` apps)
   - Direct email sending via Outlook/Gmail APIs
   - Tracking opens, clicks, replies
   - **Customer Reporting**: Comprehensive reports combining all data sources

## 📋 Getting Started for New Contributors

### First Time Setup

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd cerebrasHackathon
   ```

2. **Run the one-click setup:**
   - **Windows:** Double-click `start-app.bat` or run `start-app.bat` in terminal
   - **Mac/Linux:** Run `./start-app.sh` in terminal

3. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000/api/
   - Django Admin: http://localhost:8000/admin/


## 🛠️ Quick Setup (Recommended)

### One-Click Setup

For the fastest setup, use the provided startup scripts that automatically install dependencies and start both servers:

#### Windows Users:
```cmd
start-app.bat
```
or simply double-click the `start-app.bat` file

#### Mac/Linux Users:
```bash
./start-app.sh
```

These scripts will:
1. ✅ Install all Python dependencies (Django, DRF, etc.)
2. ✅ Install all Node.js dependencies (React, TypeScript, Tailwind CSS)
3. ✅ Run database migrations
4. ✅ Start both backend and frontend servers
5. ✅ Open both servers in separate terminal windows

## 🔗 API Endpoints

The Django backend provides the following API endpoints organized by app:

### **Onboarding API** (`/api/onboarding/`)
- `GET /api/onboarding/company-search/?name=<company>` - Search for company by name
- `POST /api/onboarding/company-profile/` - Create company profile  
- `PUT /api/onboarding/company-profile/<id>/` - Update company profile
- `GET /api/onboarding/product-suggestions/?company_id=<id>` - Get AI product suggestions
- `POST /api/onboarding/product-profile/` - Create product profile
- `GET /api/onboarding/step/?user_id=<id>` - Get current onboarding step
- `POST /api/onboarding/complete/` - Complete onboarding process

### **Companies API** (`/api/companies/`)
- `GET /api/companies/` - List companies with Cerebras fit scores and recommendations
- `POST /api/companies/research/` - Research companies using Perplexity + Cerebras analysis
- `POST /api/companies/customer-report/` - Generate comprehensive customer reports
- `GET /api/companies/<id>/research/` - Get company research data
- `GET /api/companies/<id>/analysis/` - Get Cerebras fit analysis
- `GET /api/companies/<id>/signals/` - Get sales signals and news

### **Contacts API** (`/api/contacts/`)
- `GET /api/contacts/?company_id=<id>` - Get contacts for company
- `POST /api/contacts/discover/` - Discover new contacts
- `GET /api/contacts/<id>/` - Get contact details
- `PUT /api/contacts/<id>/` - Update contact information
- `POST /api/contacts/bulk-enrich/` - Bulk contact enrichment

### **Outreach API** (`/api/outreach/`)
- `GET /api/outreach/templates/` - List email templates
- `POST /api/outreach/generate-email/` - Generate personalized email
- `POST /api/outreach/campaigns/` - Create email campaign
- `GET /api/outreach/campaigns/<id>/stats/` - Get campaign statistics
- `POST /api/outreach/send/` - Send individual email

### **Integrations API** (`/api/integrations/`)
- `GET /api/integrations/status/` - Check integration statuses
- `POST /api/integrations/sync/` - Trigger data synchronization
- `GET /api/integrations/rate-limits/` - Check API rate limits
- `POST /api/integrations/configure/` - Configure API credentials

### **AI Services API** (`/api/ai-services/`)
- `POST /api/ai-services/text-generation/` - Generate text using AI
- `POST /api/ai-services/semantic-search/` - Perform semantic search
- `POST /api/ai-services/entity-extraction/` - Extract entities from text
- `GET /api/ai-services/models/` - List available AI models

## 🎨 Frontend Features

- **Responsive Design**: Works on desktop, tablet, and mobile
- **Modern UI**: Clean, professional design with Tailwind CSS
- **API Integration**: Real-time data fetching from Django backend
- **Loading States**: User-friendly loading and error handling
- **TypeScript**: Full type safety and better developer experience

## 🔧 Backend Features

- **REST API**: Clean, RESTful API design
- **CORS Support**: Configured for frontend-backend communication
- **Django Admin**: Built-in admin interface
- **Extensible**: Easy to add new API endpoints and models

## 📱 Accessing the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000/api/
- **Django Admin**: http://localhost:8000/admin/

## 🧪 Testing the Connection

1. Start both servers (backend on port 8000, frontend on port 3000)
2. Open http://localhost:3000 in your browser
3. You should see:
   - A green status indicator showing "API: online"
   - Feature cards loaded from the Django backend
   - Footer showing the count of items from the API

## 🔧 Development

### Adding New Features

#### **Frontend Development**
1. **New API Service**: Create corresponding service in `frontend/src/api/` matching Django app
2. **New Components**: Add to appropriate component category (`ui/`, `forms/`, `chatbot/`, etc.)
3. **New Pages**: Create in relevant user flow directory (`auth/`, `onboarding/`, `workspace/`)
4. **Update Types**: Add TypeScript interfaces in `frontend/src/api/types.ts`

#### **Backend Development**
1. **New Django App**: Create with standard structure (models/, services/, views.py, urls.py)
2. **Database Models**: Add to `app/models/` directory
3. **Business Logic**: Implement in `app/services/` for reusability
4. **Background Tasks**: Add to `app/tasks.py` for async processing
5. **API Endpoints**: Define in `app/views.py` and route in `app/urls.py`

### **Adding New API Endpoints**

1. **Backend**: Add new views in `backend/<app>/views.py`
2. **URL Routing**: Add patterns in `backend/<app>/urls.py`
3. **Frontend**: Update corresponding service in `frontend/src/api/<app>Actions.ts`
4. **Types**: Update interfaces in `frontend/src/api/types.ts`

### **Development Workflow**

1. **Plan Feature**: Identify which Django app(s) and frontend components needed
2. **Backend First**: Create models, services, and APIs
3. **Frontend Integration**: Create/update API services and components
4. **Test Integration**: Verify frontend-backend communication
5. **Add Background Tasks**: For long-running operations (email sending, data processing)

### **Customizing the Frontend**

- **Main App**: Modify `frontend/src/App.tsx` for app-level changes
- **New Components**: Add to appropriate category in `frontend/src/components/`
- **New Pages**: Add to user flow directory in `frontend/src/pages/`
- **Styling**: Use Tailwind CSS classes for consistent design
- **Routing**: Update `frontend/src/routers/index.tsx` for new routes

## 📦 Dependencies

### **Frontend Dependencies**
- **React 18** - UI framework
- **TypeScript** - Type safety and developer experience
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client for API calls
- **React Router** - Client-side routing
- **React Hook Form** - Form handling and validation

### **Backend Dependencies**
- **Django 4.2** - Web framework
- **Django REST Framework** - API framework
- **Celery** - Background task processing
- **Redis** - Message broker and caching
- **PostgreSQL** - Primary database (production)
- **SQLite** - Development database
- **django-cors-headers** - CORS handling
- **python-decouple** - Environment configuration
- **requests** - HTTP client for external APIs

### **AI/ML Dependencies**
- **OpenAI** - GPT models for text generation
- **sentence-transformers** - Semantic search capabilities
- **spaCy** - Natural language processing
- **pandas** - Data manipulation and analysis
- **scikit-learn** - Machine learning utilities

### **External Integrations**
- **Clearbit API** - Company data enrichment
- **Crunchbase API** - Startup and funding data
- **LinkedIn API** - Professional network data
- **Apollo.io API** - Contact discovery
- **Microsoft Graph API** - Outlook integration
- **Gmail API** - Gmail integration

*Last updated: August 2, 2025*

## Setup API Key

in `backend/common/.env` setup:

```
PERPLEXITY_API_KEY=<your perplexity key>
CEREBRAS_API_KEY=<your cerebras key>
```