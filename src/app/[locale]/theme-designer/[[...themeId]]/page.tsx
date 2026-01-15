
import { getTheme } from "@/features/theme-designer/actions/themes";
import Editor from "@/features/theme-designer/components/editor/editor";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Theme Designer - Request Admin",
    description:
        "Easily customize and preview your theme. Modify colors, fonts, and styles in real-time.",
};

export default async function EditorPage({ params }: { params: Promise<{ themeId: string[] }> }) {
    const { themeId } = await params;
    const themePromise = themeId?.length > 0 ? getTheme(themeId?.[0]) : Promise.resolve(null);

    return <Editor themePromise={themePromise} />;
}
