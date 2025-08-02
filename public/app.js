// Main application entry point
document.addEventListener('DOMContentLoaded', () => {
    const root = document.getElementById('root');
    
    // Application state
    const state = {
        currentView: 'chatbot', // chatbot or inbox
        companyProfile: null,
        productProfiles: [],
        customerCompanies: [],
        selectedCompany: null,
        selectedClient: null,
        emailTemplates: {}
    };
    
    // DOM elements
    const elements = {
        navbar: null,
        mainContent: null
    };
    
    // Initialize the application
    function initApp() {
        renderNavbar();
        renderMainContent();
        setupEventListeners();
    }
    
    // Render the navigation bar
    function renderNavbar() {
        const navbar = document.createElement('nav');
        navbar.className = 'bg-gray-800 text-white p-4 flex justify-between items-center';
        navbar.innerHTML = `
            <div class="text-xl font-bold">B2B Outreach Automation</div>
            <div class="flex space-x-4">
                <button id="chatbot-view" class="px-3 py-2 rounded ${state.currentView === 'chatbot' ? 'bg-blue-600' : 'bg-gray-700'}">
                    <i class="fas fa-robot mr-2"></i>Chatbot
                </button>
                <button id="inbox-view" class="px-3 py-2 rounded ${state.currentView === 'inbox' ? 'bg-blue-600' : 'bg-gray-700'}">
                    <i class="fas fa-envelope mr-2"></i>Inbox
                </button>
            </div>
        `;
        
        if (elements.navbar) {
            elements.navbar.replaceWith(navbar);
        } else {
            document.body.insertBefore(navbar, root);
        }
        
        elements.navbar = navbar;
    }
    
    // Render the main content area
    function renderMainContent() {
        root.innerHTML = '';
        const mainContent = document.createElement('div');
        mainContent.className = 'container mx-auto p-4';
        
        if (state.currentView === 'chatbot') {
            renderChatbot(mainContent);
        } else {
            renderInbox(mainContent);
        }
        
        root.appendChild(mainContent);
        elements.mainContent = mainContent;
    }
    
    // Render the chatbot interface
    function renderChatbot(container) {
        container.innerHTML = `
            <div class="max-w-4xl mx-auto">
                <h1 class="text-3xl font-bold mb-6 text-center">Company & Product Profiling</h1>
                <div id="chat-container" class="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <div id="chat-messages" class="h-96 overflow-y-auto mb-4"></div>
                    <div id="chat-input-container" class="flex">
                        <input id="chat-input" type="text" class="flex-1 border border-gray-300 rounded-l-lg p-2" placeholder="Type your message here...">
                        <button id="chat-send" class="bg-blue-600 text-white px-4 py-2 rounded-r-lg">Send</button>
                    </div>
                </div>
                <div id="profiles-container" class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div id="company-profile-card" class="bg-white rounded-lg shadow-lg p-6">
                        <h2 class="text-xl font-bold mb-4">Company Profile</h2>
                        <div id="company-profile-content" class="text-gray-600">
                            <p>No company profile created yet.</p>
                        </div>
                    </div>
                    <div id="product-profiles-card" class="bg-white rounded-lg shadow-lg p-6">
                        <h2 class="text-xl font-bold mb-4">Product Profiles</h2>
                        <div id="product-profiles-content" class="text-gray-600">
                            <p>No product profiles created yet.</p>
                        </div>
                    </div>
                    <div id="customer-companies-card" class="bg-white rounded-lg shadow-lg p-6">
                        <h2 class="text-xl font-bold mb-4">Customer Companies</h2>
                        <div id="customer-companies-content" class="text-gray-600">
                            <p>No customer companies generated yet.</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Initialize chat
        initChatbot();
        updateProfilesDisplay();
    }
    
    // Initialize the chatbot functionality
    function initChatbot() {
        const chatMessages = document.getElementById('chat-messages');
        const chatInput = document.getElementById('chat-input');
        const chatSend = document.getElementById('chat-send');
        
        // Add initial bot message
        addBotMessage("Hello! I'm here to help you identify potential customers for your business. Let's start by getting information about your company. What is the name of your company?");
        
        // Send message on button click
        chatSend.addEventListener('click', () => {
            const message = chatInput.value.trim();
            if (message) {
                addUserMessage(message);
                processUserMessage(message);
                chatInput.value = '';
            }
        });
        
        // Send message on Enter key
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const message = chatInput.value.trim();
                if (message) {
                    addUserMessage(message);
                    processUserMessage(message);
                    chatInput.value = '';
                }
            }
        });
    }
    
    // Add a user message to the chat
    function addUserMessage(text) {
        const chatMessages = document.getElementById('chat-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = 'mb-4 text-right';
        messageDiv.innerHTML = `
            <div class="inline-block bg-blue-500 text-white rounded-lg px-4 py-2 max-w-xs md:max-w-md">
                ${text}
            </div>
        `;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // Add a bot message to the chat
    function addBotMessage(text) {
        const chatMessages = document.getElementById('chat-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = 'mb-4';
        messageDiv.innerHTML = `
            <div class="inline-block bg-gray-200 text-gray-800 rounded-lg px-4 py-2 max-w-xs md:max-w-md">
                ${text}
            </div>
        `;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // Process user message and respond appropriately
    function processUserMessage(message) {
        // This is a simplified implementation
        // In a real application, this would be more sophisticated
        
        if (!state.companyProfile) {
            // First step: collect company information
            state.companyProfile = {
                name: message,
                industry: "Technology",
                size: "100-500 employees",
                description: "A innovative company providing solutions in the technology sector.",
                website: "https://example.com"
            };
            
            addBotMessage(`Thanks for providing your company name: ${message}. I've created a profile for your company. Now, let's talk about your products. What product would you like to sell today?`);
            updateProfilesDisplay();
        } else if (state.productProfiles.length === 0) {
            // Second step: collect product information
            state.productProfiles.push({
                name: message,
                description: "An innovative product that helps businesses improve their operations.",
                features: ["Feature 1", "Feature 2", "Feature 3"],
                targetIndustries: ["Technology", "Finance", "Healthcare"]
            });
            
            addBotMessage(`Great! I've created a profile for your product: ${message}. Based on your company and product information, I've identified some potential customer companies. Would you like to see them?`);
            updateProfilesDisplay();
        } else if (message.toLowerCase().includes('yes') || message.toLowerCase().includes('sure') || message.toLowerCase().includes('okay')) {
            // Third step: generate customer companies
            state.customerCompanies = [
                {
                    id: 1,
                    name: "Tech Solutions Inc.",
                    industry: "Technology",
                    size: "500-1000 employees",
                    description: "A leading provider of enterprise software solutions specializing in cloud infrastructure and data analytics.",
                    website: "https://techsolutions.com",
                    fitReason: "Strong alignment with your software products and similar target market."
                },
                {
                    id: 2,
                    name: "Global Innovations Ltd.",
                    industry: "Technology",
                    size: "1000+ employees",
                    description: "Multinational technology company focused on AI-driven business solutions and digital transformation services.",
                    website: "https://globalinnovations.com",
                    fitReason: "Large enterprise with significant budget for technology solutions matching your product offerings."
                },
                {
                    id: 3,
                    name: "Future Enterprises",
                    industry: "Consulting",
                    size: "50-100 employees",
                    description: "Business consulting firm helping companies optimize operations and implement new technologies.",
                    website: "https://futureenterprises.com",
                    fitReason: "Consulting firms often need your type of software to enhance their service offerings to clients."
                }
            ];
            
            addBotMessage("Here are some potential customer companies I've identified for you:");
            
            state.customerCompanies.forEach(company => {
                addBotMessage(`${company.name} - ${company.industry} (${company.size})<br>${company.description}<br><em>Why they're a good fit: ${company.fitReason}</em>`);
            });
            
            addBotMessage("You can now switch to the Inbox view to see these companies in a more detailed format.");
            updateProfilesDisplay();
        } else {
            addBotMessage("I'm not sure how to respond to that. If you've completed the company and product profiling, you can switch to the Inbox view to see potential customer companies.");
        }
    }
    
    // Update the profiles display
    function updateProfilesDisplay() {
        // Update company profile display
        const companyProfileContent = document.getElementById('company-profile-content');
        if (state.companyProfile) {
            companyProfileContent.innerHTML = `
                <p><strong>Name:</strong> ${state.companyProfile.name}</p>
                <p><strong>Industry:</strong> ${state.companyProfile.industry}</p>
                <p><strong>Size:</strong> ${state.companyProfile.size}</p>
                <p><strong>Description:</strong> ${state.companyProfile.description}</p>
                <p><strong>Website:</strong> <a href="${state.companyProfile.website}" target="_blank" class="text-blue-600">${state.companyProfile.website}</a></p>
            `;
        }
        
        // Update product profiles display
        const productProfilesContent = document.getElementById('product-profiles-content');
        if (state.productProfiles.length > 0) {
            productProfilesContent.innerHTML = state.productProfiles.map(product => `
                <div class="mb-4 p-2 border border-gray-200 rounded">
                    <p><strong>${product.name}</strong></p>
                    <p>${product.description}</p>
                    <p class="text-sm"><strong>Features:</strong> ${product.features.join(', ')}</p>
                </div>
            `).join('');
        }
        
        // Update customer companies display
        const customerCompaniesContent = document.getElementById('customer-companies-content');
        if (state.customerCompanies.length > 0) {
            customerCompaniesContent.innerHTML = state.customerCompanies.map(company => `
                <div class="mb-4 p-2 border border-gray-200 rounded">
                    <p><strong>${company.name}</strong></p>
                    <p>${company.industry} (${company.size})</p>
                    <p class="text-sm">${company.description}</p>
                </div>
            `).join('');
        }
    }
    
    // Render the inbox interface
    function renderInbox(container) {
        container.innerHTML = `
            <div class="max-w-6xl mx-auto">
                <h1 class="text-3xl font-bold mb-6 text-center">Customer Outreach Inbox</h1>
                <div class="flex flex-col md:flex-row gap-6">
                    <div id="companies-sidebar" class="md:w-1/3 bg-white rounded-lg shadow-lg p-6">
                        <h2 class="text-xl font-bold mb-4">Potential Customers</h2>
                        <div id="companies-list" class="space-y-2">
                            <!-- Companies will be loaded here -->
                        </div>
                    </div>
                    <div id="company-details" class="md:w-2/3 bg-white rounded-lg shadow-lg p-6">
                        <div id="company-info" class="mb-6">
                            <h2 class="text-xl font-bold mb-2">Company Details</h2>
                            <div id="company-details-content" class="text-gray-600">
                                <p>Select a company from the sidebar to view details.</p>
                            </div>
                        </div>
                        <div id="potential-clients" class="mb-6">
                            <h2 class="text-xl font-bold mb-2">Potential Clients</h2>
                            <div id="clients-list" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <!-- Clients will be loaded here -->
                            </div>
                        </div>
                        <div id="email-template">
                            <h2 class="text-xl font-bold mb-2">Email Template</h2>
                            <div id="template-content" class="text-gray-600">
                                <p>Select a client to generate an email template.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Load companies
        loadCompanies();
    }
    
    // Load companies for the inbox
    function loadCompanies() {
        // In a real implementation, this would fetch from the backend
        // For now, we'll use sample data
        const companies = [
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
        
        const companiesList = document.getElementById('companies-list');
        companiesList.innerHTML = companies.map(company => `
            <div class="p-3 border border-gray-200 rounded cursor-pointer hover:bg-gray-50 company-item" data-id="${company.id}">
                <div class="flex justify-between">
                    <h3 class="font-bold">${company.name}</h3>
                    ${company.unreadMessages > 0 ? `<span class="bg-blue-500 text-white rounded-full px-2 py-1 text-xs">${company.unreadMessages}</span>` : ''}
                </div>
                <p class="text-sm text-gray-600">${company.industry}</p>
                <p class="text-xs text-gray-500">Last contacted: ${company.lastContacted}</p>
            </div>
        `).join('');
        
        // Add event listeners to company items
        document.querySelectorAll('.company-item').forEach(item => {
            item.addEventListener('click', () => {
                const companyId = item.getAttribute('data-id');
                loadCompanyDetails(companyId);
            });
        });
    }
    
    // Load company details
    function loadCompanyDetails(companyId) {
        state.selectedCompany = companyId;
        
        // In a real implementation, this would fetch from the backend
        // For now, we'll use sample data
        const companyDetails = {
            id: companyId,
            name: "Tech Solutions Inc.",
            industry: "Technology",
            size: "500-1000 employees",
            description: "A leading provider of enterprise software solutions specializing in cloud infrastructure and data analytics.",
            website: "https://techsolutions.com",
            fitReason: "Strong alignment with your software products and similar target market.",
        };
        
        const companyDetailsContent = document.getElementById('company-details-content');
        companyDetailsContent.innerHTML = `
            <p><strong>Name:</strong> ${companyDetails.name}</p>
            <p><strong>Industry:</strong> ${companyDetails.industry}</p>
            <p><strong>Size:</strong> ${companyDetails.size}</p>
            <p><strong>Description:</strong> ${companyDetails.description}</p>
            <p><strong>Website:</strong> <a href="${companyDetails.website}" target="_blank" class="text-blue-600">${companyDetails.website}</a></p>
            <p><strong>Why they're a good fit:</strong> ${companyDetails.fitReason}</p>
        `;
        
        // Load potential clients
        loadPotentialClients(companyId);
    }
    
    // Load potential clients for a company
    function loadPotentialClients(companyId) {
        // In a real implementation, this would fetch from the backend
        // For now, we'll use sample data
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
        
        const clientsList = document.getElementById('clients-list');
        clientsList.innerHTML = potentialClients.map(client => `
            <div class="p-4 border border-gray-200 rounded client-item" data-id="${client.id}" data-role="${client.role}">
                <div class="flex items-center">
                    <img src="${client.profilePicture}" alt="${client.name}" class="w-12 h-12 rounded-full mr-4">
                    <div>
                        <h3 class="font-bold">${client.name}</h3>
                        <p class="text-gray-600">${client.role}</p>
                        <a href="${client.linkedinUrl}" target="_blank" class="text-blue-600 text-sm">LinkedIn Profile</a>
                    </div>
                </div>
            </div>
        `).join('');
        
        // Add event listeners to client items
        document.querySelectorAll('.client-item').forEach(item => {
            item.addEventListener('click', () => {
                const clientId = item.getAttribute('data-id');
                const role = item.getAttribute('data-role');
                generateEmailTemplate(clientId, role);
            });
        });
    }
    
    // Generate email template for a client
    function generateEmailTemplate(clientId, role) {
        state.selectedClient = { id: clientId, role: role };
        
        // In a real implementation, this would fetch from the backend
        // For now, we'll use sample templates based on role
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
        
        const templateContent = document.getElementById('template-content');
        templateContent.innerHTML = `
            <div class="border border-gray-200 rounded p-4">
                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2" for="email-subject">Subject</label>
                    <input id="email-subject" type="text" class="w-full border border-gray-300 rounded p-2" value="${template.subject}">
                </div>
                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2" for="email-body">Body</label>
                    <textarea id="email-body" class="w-full border border-gray-300 rounded p-2 h-64">${template.body}</textarea>
                </div>
                <div class="flex justify-between">
                    <button id="edit-email" class="bg-gray-500 text-white px-4 py-2 rounded">Edit</button>
                    <button id="send-email" class="bg-green-600 text-white px-4 py-2 rounded">Send Email</button>
                </div>
            </div>
        `;
        
        // Add event listeners to buttons
        document.getElementById('edit-email').addEventListener('click', () => {
            document.getElementById('email-body').removeAttribute('readonly');
        });
        
        document.getElementById('send-email').addEventListener('click', () => {
            alert('Email sent successfully! (This is a demo)');
        });
    }
    
    // Set up event listeners for navigation
    function setupEventListeners() {
        document.getElementById('chatbot-view').addEventListener('click', () => {
            state.currentView = 'chatbot';
            renderNavbar();
            renderMainContent();
        });
        
        document.getElementById('inbox-view').addEventListener('click', () => {
            state.currentView = 'inbox';
            renderNavbar();
            renderMainContent();
        });
    }
    
    // Initialize the application
    initApp();
});
