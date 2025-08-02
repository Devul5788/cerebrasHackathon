# B2B Outreach Automation Platform

This web application helps businesses identify potential customers and automate personalized outreach processes through an AI-enabled chatbot and Outlook-like inbox interface.

## Features

- **Interactive AI Chatbot**
  - Company profiling through conversational interface
  - Product profiling with feature extraction
  - Customer company generation based on profiles
  
- **Outlook-like Inbox Interface**
  - Company sidebar with potential customers
  - Detailed company information and fit analysis
  - Web-scraped potential client listings
  - LinkedIn integration for profile pictures and details
  
- **Role-based Email Templates**
  - Dynamic email generation based on client role
  - Predefined templates for different organizational levels
  - Editable email content before sending

## Technology Stack

- Frontend: Vanilla JavaScript with Tailwind CSS
- Backend: Node.js with Express
- Database: MongoDB
- AI Integration: Perplexity API
- Email Service: SendGrid/SES
- LinkedIn Integration: LinkedIn API

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/Devul5788/cerebrasHackathon.git
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open your browser to `http://localhost:3000`

## Application Workflow

1. **Chatbot Interface**
   - Start by providing your company information
   - Add product details you want to sell
   - Generate potential customer companies

2. **Inbox Interface**
   - Browse generated customer companies in sidebar
   - View detailed company information and fit analysis
   - See potential clients within each company
   - Generate and customize role-based email templates
   - Send emails directly from the interface

## API Endpoints

- `/api/chatbot/company` - Create company profile
- `/api/chatbot/product` - Create product profile
- `/api/chatbot/generate-customers` - Generate customer companies
- `/api/inbox/companies` - Get list of potential customer companies
- `/api/inbox/company/:id` - Get detailed company information
- `/api/inbox/templates/:role` - Get email template for specific role

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
