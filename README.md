# Local Help - Community Skill & Service Exchange

[![T3 Stack](https://create.t3.gg/images/create-t3-app.svg)](https://create.t3.gg/)

## Introduction

Local Help is a community-driven platform designed to connect neighbors for skill-sharing, service exchange, mutual support, and reporting lost or found items. Our mission is to foster stronger, more resilient local communities by making it easy for people to offer their skills, find help nearby, and reconnect lost items with their owners, all without intermediaries or excessive fees.

Whether you need help fixing something, want to learn a new skill, have a skill to offer, or found/lost an item, Local Help provides a trusted space to connect with people in your immediate area.

## Key Features

*   **Skill Exchange:** Post offers or requests for a wide variety of skills and services (e.g., tutoring, gardening, tech help, repairs).
*   **Local Focus:** Discover opportunities and connect with people based on proximity using location services and distance filtering. Posts are relevant to your neighborhood.
*   **Lost & Found:** A dedicated section to post details about items you've lost or found, helping reunite them with their owners within the community.
*   **Direct Messaging:** Securely communicate with other users via the integrated chat system to coordinate exchanges, ask questions, and build connections.
*   **User Profiles & Authentication:** Secure sign-up and login managed by Clerk. Users can manage their profile information.
*   **Address Management:** Users can optionally add and manage their address details for more accurate location-based services.
*   **Post Management:** Users can view, edit, and delete their own posts.
*   **Search & Filtering:** Easily find relevant skill exchange or lost/found posts using keyword search, distance sliders, and sorting options.
*   **Responsive Design:** Access the platform seamlessly on desktop, tablet, and mobile devices.
*   **Interactive UI:** Modern user interface built with Shadcn/ui, Tailwind CSS, and animations using Framer Motion.

## Technology Stack

This project is built using the [T3 Stack](https://create.t3.gg/) and leverages modern web technologies:

*   **Framework:** [Next.js](https://nextjs.org/) (React)
*   **API:** [tRPC](https://trpc.io/) (End-to-end typesafe APIs)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
*   **UI Components:** [Shadcn/ui](https://ui.shadcn.com/)
*   **Animation:** [Framer Motion](https://www.framer.com/motion/)
*   **Database ORM:** [Drizzle ORM](https://orm.drizzle.team/)
*   **Database:** [PostgreSQL](https://www.postgresql.org/)
*   **Authentication:** [Clerk](https://clerk.com/)
*   **Schema Validation:** [Zod](https://zod.dev/)
*   **Geocoding/Mapping:** [Nominatim (OpenStreetMap)](https://nominatim.org/) for address lookup and reverse geocoding.
*   **Deployment:** (Likely Vercel, based on T3 defaults)

## Getting Started

To get a local copy up and running, follow these steps:

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd local_help
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    # or yarn install or pnpm install
    ```
3.  **Set up environment variables:**
    *   Create a `.env` file in the root directory.
    *   Copy the contents of `.env.example` (if it exists) or add the required variables:
        ```env
        # Database Connection
        POSTGRES_URL="your_postgresql_connection_string"

        # Clerk Authentication Keys (Get from Clerk dashboard)
        NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="your_clerk_publishable_key"
        CLERK_SECRET_KEY="your_clerk_secret_key"

        # Optional: Clerk webhook secret for advanced integrations
        # CLERK_WEBHOOK_SECRET="your_clerk_webhook_secret"

        # Node Environment
        NODE_ENV="development"
        ```
4.  **Set up the PostgreSQL database:**
    *   Ensure you have PostgreSQL installed and running.
    *   Create a database for the project.
    *   Update the `POSTGRES_URL` in your `.env` file accordingly.
5.  **Run database migrations:**
    *   Push the schema changes to your database:
        ```bash
        npm run db:push
        ```
6.  **Start the development server:**
    ```bash
    npm run dev
    ```
7.  Open [http://localhost:3000](http://localhost:3000) in your browser.

## How to Use Local Help

1.  **Sign Up / Sign In:** Create an account or log in using Clerk authentication.
2.  **Explore:** Browse the "Local Posts" section to see skill offers/requests near you or check the "Lost & Found" section.
3.  **Filter & Search:** Use the search bar, distance slider, and sorting options to find exactly what you're looking for.
4.  **Create a Post:**
    *   Go to "New Post" to offer a skill or request help. Provide details like skill, description, and confirm your location.
    *   Go to "Lost & Found" > "Post New Item" to report a lost or found item, including details, category, and location.
5.  **Manage Your Posts:** Visit "My Posts" or "My Items" (in Lost & Found) to view, edit, or delete your contributions.
6.  **Communicate:** Click "Contact" or "View Chat" on a post to initiate or continue a conversation with the user via the platform's messaging system.
7.  **Manage Account:** Update your profile or manage your saved address in the account settings.

## Learn More about T3 Stack

To learn more about the [T3 Stack](https://create.t3.gg/), take a look at the following resources:

-   [Documentation](https://create.t3.gg/)
-   [Learn the T3 Stack](https://create.t3.gg/en/faq#what-learning-resources-are-currently-available) — Check out these awesome tutorials

You can check out the [create-t3-app GitHub repository](https://github.com/t3-oss/create-t3-app) — your feedback and contributions are welcome!

## How do I deploy this?

Follow the deployment guides for [Vercel](https://create.t3.gg/en/deployment/vercel), [Netlify](https://create.t3.gg/en/deployment/netlify) and [Docker](https://create.t3.gg/en/deployment/docker) for more information. Ensure your environment variables (database connection, Clerk keys) are correctly configured in your deployment environment.
