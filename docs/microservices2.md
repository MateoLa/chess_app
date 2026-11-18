Microservices. (Part 2)

To develop microservices with Ruby on Rails, you shift away from the traditional monolithic architecture ("The Majestic Monolith") and split your business logic into independent, single-purpose Rails applications.

Here is how you design, build, and connect them.

1. Optimize Rails for Microservices (API-Only Mode)

Microservices rarely need a frontend UI layer; they usually communicate via data. When creating a new microservice, use the API-only flag to skip asset pipelines and middleware you do not need, making the application much lighter:

```bash
rails new your_service_name --api
```

2. Choose Your Communication Strategy

Microservices must talk to each other. In Rails, you will generally use one of two methods:

• Synchronous (HTTP/REST or gRPC): One service calls another directly and waits for a response. <br>
	• Use the faraday or httparty gems to make clean HTTP requests to other services. <br>
	• Use grpc gems for high-performance, low-latency binary communication.

• Asynchronous (Event-Driven): Services emit events when things change, and other services listen. This is the best practice for decoupling services. <br>
	• Use RabbitMQ (via the bunny gem) or Apache Kafka (via the karafka gem) to handle asynchronous messaging.

3. Handle Shared Data and Databases

• Database per Service: Every microservice must have its own database. For example, your Billing Service should never directly query the database of your User Service. <br>
• Data Replication: If the Billing Service needs user details, it should store a local cache of the user data and update it asynchronously via event messages whenever a user is updated.

4. Manage Authentication and Traffic

• API Gateway: Place an API Gateway (like Kong, AWS API Gateway, or KrakenD) in front of your services. It acts as the single point of entry for your frontend client, routing requests to the correct Rails service. <br>
• JWT (JSON Web Tokens): Use the jwt gem. The gateway or a central Auth Service authenticates the user, generates a JWT, and passes it down to the microservices so they can verify the user's identity without querying a database.

5. Deployment and Containerization

Because running multiple Rails apps locally or in production can be resource-heavy, containerization is essential: <br>
• Docker: Create a Dockerfile for each Rails service to package the exact Ruby version and dependencies needed. <br>
• Docker Compose: Use a docker-compose.yml file locally to spin up all your Rails services, databases, and message brokers with a single command.
