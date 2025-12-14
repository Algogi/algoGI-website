import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getDb } from "@/lib/firebase/config";
import { FieldValue } from "firebase-admin/firestore";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getDb();
    const formsSnapshot = await db.collection("applicationForms").orderBy("createdAt", "desc").get();

    const forms = formsSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        description: data.description || "",
        formFields: data.formFields || [],
        createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || null,
        createdBy: data.createdBy || "",
        updatedBy: data.updatedBy || "",
      };
    });

    return NextResponse.json(forms);
  } catch (error) {
    console.error("Error fetching application forms:", error);
    return NextResponse.json(
      { error: "Failed to fetch application forms" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.formFields || !Array.isArray(body.formFields)) {
      return NextResponse.json(
        { error: "Missing required fields: name, formFields" },
        { status: 400 }
      );
    }

    const db = getDb();

    const formData = {
      name: body.name,
      description: body.description || "",
      formFields: body.formFields,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      createdBy: session.email,
      updatedBy: session.email,
    };

    const docRef = await db.collection("applicationForms").add(formData);

    return NextResponse.json({
      id: docRef.id,
      ...formData,
    });
  } catch (error) {
    console.error("Error creating application form:", error);
    return NextResponse.json(
      { error: "Failed to create application form" },
      { status: 500 }
    );
  }
}

