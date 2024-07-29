
### README for Discussion Service

```markdown
# Discussion Service

This service handles discussions (posts) including creating, updating, deleting, and retrieving discussions.

## Prerequisites

- Node.js
- PostgreSQL
- Docker (optional, for running PostgreSQL in a container)

## Installation

1. Clone the repository:
    ```sh
    git clone <repository-url>
    cd discussion-service
    ```

2. Install dependencies:
    ```sh
    npm install
    ```

## Configuration

Create a `.env` file in the root directory and set the environment variables:
```env
DB_USER=gaurav
DB_HOST=localhost
DB_NAME=discussion_service_db
DB_PASSWORD=gaurav
DB_PORT=5437
JWT_SECRET=your_jwt_secret
PORT=3002
USER_SERVICE_PORT=3001
