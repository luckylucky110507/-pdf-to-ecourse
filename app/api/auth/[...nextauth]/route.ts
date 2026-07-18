import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { supabase } from "@/app/lib/supabase";

const handler = NextAuth({
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
    ],
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,
    callbacks: {
        async signIn({ user }) {
            if (!user.email) return false;

            // Check if user already exists
            const { data: existingUser } = await supabase
                .from("users")
                .select("id")
                .eq("email", user.email)
                .single();

            if (!existingUser) {
                // Create new user
                const { error } = await supabase
                    .from("users")
                    .insert({
                        email: user.email,
                        name: user.name ?? "",
                    });

                if (error) {
                    console.error("Error creating user:", error);
                }
            }

            return true;
        },
        async session({ session }) {
            if (session.user?.email) {
                const { data: dbUser } = await supabase
                    .from("users")
                    .select("id")
                    .eq("email", session.user.email)
                    .single();

                if (dbUser) {
                    (session.user as any).id = dbUser.id;
                }
            }
            return session;
        },
    },
});

export { handler as GET, handler as POST };