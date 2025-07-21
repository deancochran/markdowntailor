"use client";
import { useState } from "react";
import {
  EditorTab,
  MobileTab,
  PreviewTab,
  UseTabManagerReturn,
} from "../types";

export function useTabManager(): UseTabManagerReturn {
  const [editorsTab, setEditorsTab] = useState<EditorTab>("markdown");
  const [previewTab, setPreviewTab] = useState<PreviewTab>("preview");
  const [mobileTab, setMobileTab] = useState<MobileTab>("markdown");

  return {
    editorsTab,
    previewTab,
    mobileTab,
    setEditorsTab,
    setPreviewTab,
    setMobileTab,
  };
}
