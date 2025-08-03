from django.core.management.base import BaseCommand
from outreach.models import EmailTemplate


class Command(BaseCommand):
    help = 'Create default email templates for Cerebras outreach'

    def handle(self, *args, **options):
        templates = [
            {
                'name': 'CS-3 System Sales Template',
                'offering': 'cs3_system',
                'template_type': 'initial',
                'is_default': True,
                'description': 'For companies needing on-premise AI supercomputing infrastructure',
                'subject_line': 'Transform {company_name}\'s AI Infrastructure with Cerebras CS-3',
                'content': '''Hi {first_name},

I hope this message finds you well. I've been following {company_name}'s impressive work in {industry}, particularly your {ai_initiatives}.

At Cerebras, we're revolutionizing AI infrastructure with our CS-3 wafer-scale systems. Given {company_name}'s {ai_ml_usage}, I believe our technology could significantly accelerate your AI capabilities while reducing both latency and power consumption.

The CS-3 system offers:
• 900,000 AI-optimized cores on a single chip
• Support for models up to 24 trillion parameters
• Seamless scaling from single device to hyperscale deployments
• Dramatic performance improvements over traditional GPU clusters

Companies like {company_name} in the {industry} sector are using CS-3 systems to:
- Train massive language models faster than ever before
- Run real-time inference on complex AI workloads
- Reduce infrastructure complexity and operational costs

Would you be interested in a brief conversation about how Cerebras could help {company_name} achieve your AI objectives? I'd love to share some specific use cases relevant to {industry} companies.

Best regards,
Devul Nahar
Cerebras Systems'''
            },
            {
                'name': 'Condor Galaxy Cloud Template',
                'offering': 'condor_galaxy',
                'template_type': 'initial',
                'is_default': True,
                'description': 'For companies wanting cloud-based access to AI supercomputing',
                'subject_line': 'Cloud-Scale AI Training for {company_name} - No Hardware Investment Required',
                'content': '''Hi {first_name},

I've been researching companies making significant strides in AI, and {company_name}'s {ai_initiatives} really caught my attention.

For organizations like yours working on {ml_use_cases}, the challenge is often accessing the compute power needed for large-scale AI training without massive upfront hardware investments.

That's where Cerebras Condor Galaxy comes in - a federated network of AI supercomputers available on-demand. With Condor Galaxy, {company_name} could:

• Access exascale AI compute on a pay-per-use basis
• Train models with 600+ billion parameters
• Reduce time-to-market for AI innovations
• Eliminate infrastructure management overhead

Given your background in {technical_background} and {company_name}'s focus on {ai_ml_usage}, I think you'd find our approach to cloud-scale AI training particularly compelling.

Would you have 15 minutes this week for a quick call? I'd love to show you how companies in {industry} are using Condor Galaxy to accelerate their AI development timelines.

Best regards,
Devul Nahar
Cerebras Systems'''
            },
            {
                'name': 'AI Inference Solution Template',
                'offering': 'ai_inference',
                'template_type': 'initial',
                'is_default': True,
                'description': 'For companies needing high-performance real-time AI inference',
                'subject_line': 'Eliminate AI Inference Bottlenecks at {company_name}',
                'content': '''Hi {first_name},

As {title} at {company_name}, you're likely familiar with the inference performance challenges that come with deploying large AI models in production.

I noticed {company_name}'s work on {ai_ml_usage} and thought you might be interested in how Cerebras is solving the inference latency problem that's holding back many {industry} companies.

Our wafer-scale inference solution delivers:
• Ultra-low latency responses for real-time applications
• Elimination of external memory bottlenecks
• Support for the entire model on-chip
• Unprecedented throughput for concurrent workloads

This is particularly valuable for use cases like:
- {ml_use_cases}
- Real-time AI applications requiring instant responses
- High-volume API endpoints serving LLMs

Companies using our inference solution are seeing 10x+ improvements in response times while significantly reducing infrastructure costs.

Given {company_name}'s focus on {pain_points}, I believe this could be a game-changer for your AI deployment strategy.

Could we schedule a brief demo to show you the performance difference? I think you'll be impressed by what's possible.

Best regards,
Devul Nahar
Cerebras Systems'''
            },
            {
                'name': 'Inference API Developer Template',
                'offering': 'inference_api',
                'template_type': 'initial',
                'is_default': True,
                'description': 'For developers and technical teams integrating AI capabilities',
                'subject_line': 'Supercharge {company_name}\'s AI Integration with Cerebras API',
                'content': '''Hi {first_name},

I hope you're doing well! I came across {company_name}'s {ai_initiatives} and was impressed by your technical approach to {ml_use_cases}.

As someone with a {technical_background} background, you'll appreciate what makes our Inference API different from typical AI services:

🚀 **Ultra-fast token generation** - Orders of magnitude faster than standard APIs
🔧 **OpenAI compatibility** - Drop-in replacement for existing integrations  
🎯 **Direct access to leading models** - Llama, Mistral, and more
⚡ **Real-time performance** - Perfect for interactive applications

The API is designed for developers who need:
- Lightning-fast response times for chatbots and assistants
- High-throughput inference for production applications  
- Seamless migration from existing AI services
- Reliable, scalable infrastructure

Given {company_name}'s work on {pain_points}, I think you'd find our performance benchmarks particularly interesting. We're seeing developers reduce their inference latency by 10x+ while maintaining the same integration simplicity.

Would you be interested in trying our API? I can set you up with credits to test it against your current solution.

Best regards,
Devul Nahar
Cerebras Systems'''
            },
            {
                'name': 'Model Studio Hosting Template',
                'offering': 'model_studio',
                'template_type': 'initial',
                'is_default': True,
                'description': 'For companies needing managed model training and hosting',
                'subject_line': 'Streamline {company_name}\'s AI Model Development',
                'content': '''Hi {first_name},

I've been following {company_name}'s innovative work in {industry}, particularly your {ai_initiatives}.

Managing the complexity of training and hosting large AI models can be a significant challenge, especially when you want to focus on your core business rather than infrastructure management.

Cerebras Model Studio provides a fully managed environment for:
• Training custom models on proprietary data
• Fine-tuning existing models for specific use cases
• Hosting and serving models at scale
• Rapid iteration and experimentation

This is particularly valuable for companies like {company_name} that need:
- {ml_use_cases} with custom requirements
- Secure, isolated compute environments
- Fast time-to-market for AI innovations
- Enterprise-grade reliability and support

The managed approach means your team can focus on {pain_points} while we handle the infrastructure complexity.

I'd love to show you how Model Studio could accelerate {company_name}'s AI initiatives. Could we schedule a brief call to discuss your specific requirements?

Best regards,
Devul Nahar
Cerebras Systems'''
            },
            # Follow-up Templates
            {
                'name': 'CS-3 System Follow-Up Template',
                'offering': 'cs3_system',
                'template_type': 'follow_up',
                'is_default': True,
                'description': 'Follow-up template for CS-3 system initial outreach',
                'subject_line': 'Quick follow-up: Cerebras CS-3 benefits for {company_name}',
                'content': '''Hi {first_name},

I hope you're doing well! I wanted to follow up on my previous message about how Cerebras CS-3 systems could transform {company_name}'s AI infrastructure.

I understand you're likely evaluating multiple solutions for your AI needs. Here's what sets Cerebras apart:

**Immediate Impact:**
• 10x faster training compared to GPU clusters
• Single-chip architecture eliminates memory bottlenecks
• Simplified deployment and management

**ROI Benefits:**
• Reduced time-to-market for AI models
• Lower operational complexity and costs
• Future-proof scalability for growing AI demands

Many companies in {industry} have seen dramatic improvements in their AI development cycles after switching to Cerebras.

Would a 15-minute call this week work to discuss how we could specifically help {company_name} achieve similar results?

Best regards,
Devul Nahar
Cerebras Systems

P.S. I can share some relevant case studies from similar companies if that would be helpful.'''
            },
            {
                'name': 'Condor Galaxy Follow-Up Template',
                'offering': 'condor_galaxy',
                'template_type': 'follow_up',
                'is_default': True,
                'description': 'Follow-up template for Condor Galaxy cloud access',
                'subject_line': 'Still evaluating cloud AI solutions? Let\'s chat about Condor Galaxy',
                'content': '''Hi {first_name},

I wanted to follow up on our conversation about cloud-scale AI training solutions for {company_name}.

Since my last message, I've been thinking about your specific use case around {ml_use_cases}, and I believe Condor Galaxy could provide exactly what you need:

**Key Advantages:**
• No upfront hardware investment required
• Access to exascale compute on-demand
• Pay only for what you use
• Immediate availability (no procurement delays)

**Perfect for your needs:**
• Training large models without infrastructure hassles
• Rapid prototyping and experimentation
• Scaling up during peak development periods

I'd love to offer you a pilot program to test Condor Galaxy with your actual workloads. This would give you hands-on experience with the platform before making any commitments.

Are you available for a brief call this week to discuss this opportunity?

Best regards,
Devul Nahar
Cerebras Systems'''
            },
            {
                'name': 'AI Inference Follow-Up Template',
                'offering': 'ai_inference',
                'template_type': 'follow_up',
                'is_default': True,
                'description': 'Follow-up template for AI inference solutions',
                'subject_line': 'Solving inference latency challenges at {company_name}',
                'content': '''Hi {first_name},

Following up on my previous message about AI inference performance challenges that many {industry} companies face.

I've been researching more about {company_name}'s specific use cases, and I'm even more convinced that our wafer-scale inference solution could provide significant value:

**Your current challenges likely include:**
• High latency affecting user experience
• Complex infrastructure management
• Scaling costs with increased usage
• Memory limitations with large models

**Our solution addresses these directly:**
• Sub-millisecond inference latency
• Entire models fit on a single chip
• Linear scaling without complexity
• Predictable, cost-effective pricing

I'd like to propose a technical deep-dive session where our engineering team can show you the actual performance differences. We can even benchmark against your current solution.

Would next week work for a 30-minute technical demo?

Best regards,
Devul Nahar
Cerebras Systems'''
            },
            {
                'name': 'Inference API Follow-Up Template',
                'offering': 'inference_api',
                'template_type': 'follow_up',
                'is_default': True,
                'description': 'Follow-up template for Inference API integration',
                'subject_line': 'Ready to try our ultra-fast Inference API, {first_name}?',
                'content': '''Hi {first_name},

I wanted to follow up on the Cerebras Inference API and see if you've had a chance to consider it for {company_name}'s AI integration needs.

Since my last message, we've had several developers from similar companies report some impressive results:

**Recent benchmarks show:**
• 10-15x faster token generation vs. standard APIs
• 99.9% uptime with enterprise SLA
• Seamless drop-in replacement for existing integrations
• Cost savings of 30-40% at scale

**Easy to get started:**
• OpenAI-compatible endpoints
• Comprehensive documentation
• Free trial credits available
• Migration support from our team

I can set you up with trial credits today so your team can test it against your current solution. No strings attached - just see the performance difference for yourself.

Interested in giving it a try? I can have you set up within minutes.

Best regards,
Devul Nahar
Cerebras Systems'''
            },
            {
                'name': 'Model Studio Follow-Up Template',
                'offering': 'model_studio',
                'template_type': 'follow_up',
                'is_default': True,
                'description': 'Follow-up template for Model Studio managed services',
                'subject_line': 'Simplifying AI model development at {company_name}',
                'content': '''Hi {first_name},

I hope you've had a chance to think about our previous conversation regarding Cerebras Model Studio for {company_name}'s AI model development needs.

I realize you're probably weighing different options for managing your AI infrastructure. Here's why many companies choose Model Studio:

**Eliminates common pain points:**
• No more infrastructure management overhead
• Faster iteration cycles for model development
• Reduced time from concept to production
• Built-in security and compliance features

**Perfect for teams that want to focus on:**
• Core AI/ML innovation
• Business logic and applications
• Rapid experimentation and testing
• Scaling successful models quickly

**What's included:**
• Fully managed training environment
• Model hosting and serving infrastructure
• 24/7 monitoring and support
• Enterprise-grade security and reliability

I'd love to arrange a hands-on demo where you can see exactly how Model Studio would fit into {company_name}'s workflow.

Could we schedule 20 minutes next week for a personalized walkthrough?

Best regards,
Devul Nahar
Cerebras Systems'''
            }
        ]

        created_count = 0
        updated_count = 0

        for template_data in templates:
            template, created = EmailTemplate.objects.get_or_create(
                name=template_data['name'],
                defaults=template_data
            )
            
            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'Created template: {template.name}')
                )
            else:
                # Update existing template
                for key, value in template_data.items():
                    setattr(template, key, value)
                template.save()
                updated_count += 1
                self.stdout.write(
                    self.style.WARNING(f'Updated template: {template.name}')
                )

        self.stdout.write(
            self.style.SUCCESS(
                f'\nSummary: {created_count} templates created, {updated_count} templates updated'
            )
        )
