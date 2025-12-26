"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Page,
  Layout,
  Text,
  Card,
  Button,
  BlockStack,
  Box,
  InlineStack,
  DropZone,
  Badge,
  Modal,
  TextField,
  ProgressBar,
  Spinner,
  Tooltip,
  Checkbox,
  TextContainer,
  Tabs,
} from "@shopify/polaris";
import { NoteIcon, DeleteIcon, MaximizeIcon, SaveIcon, PersonIcon, PlayIcon, PlayCircleIcon, ArrowRightIcon } from "@shopify/polaris-icons";
import "@shopify/polaris/build/esm/styles.css";
import enTranslations from "@shopify/polaris/locales/en.json";
import { AppProvider } from "@shopify/polaris";

// OptionGrid Component
const OptionGrid = ({ label, options, selected, onChange }: {
  label?: string;
  options: { value: string; label: string; icon: string }[];
  selected: string;
  onChange: (v: string) => void;
}) => (
  <div style={{ marginBottom: '16px' }}>
    {label && <Text variant="bodyMd" fontWeight="semibold" as="p">{label}</Text>}
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '8px', marginTop: '8px' }}>
      {options.map((opt) => (
        <div
          key={opt.value}
          onClick={() => onChange(opt.value)}
          style={{
            border: selected === opt.value ? '2px solid #008060' : '1px solid #e1e3e5',
            borderRadius: '8px',
            padding: '8px',
            cursor: 'pointer',
            background: selected === opt.value ? '#f1f8f5' : 'white',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '24px', marginBottom: '4px' }}>{opt.icon}</div>
          <Text variant="bodyXs" tone={selected === opt.value ? 'success' : 'subdued'}>{opt.label}</Text>
        </div>
      ))}
    </div>
  </div>
);

export default function Dashboard() {
  // State
  const [credits, setCredits] = useState(100);
  const [selectedProducts, setSelectedProducts] = useState<any[]>([]);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState('auto');
  const [previewImage, setPreviewImage] = useState<any>(null);
  const [customModels, setCustomModels] = useState<any[]>([]);
  const [customLocations, setCustomLocations] = useState<any[]>([]);
  const [customPlacements, setCustomPlacements] = useState<any[]>([]);
  const [locationTab, setLocationTab] = useState('locations');
  const [productType, setProductType] = useState('auto');
  const [deletedPresetIds, setDeletedPresetIds] = useState<string[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  const [batchResults, setBatchResults] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [totalToGenerate, setTotalToGenerate] = useState(0);
  const [generatedCount, setGeneratedCount] = useState(0);

  const [videoResults, setVideoResults] = useState<any[]>([]);
  const [isVideoGenerating, setIsVideoGenerating] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [generatedVideoCount, setGeneratedVideoCount] = useState(0);
  const [totalVideoCount, setTotalVideoCount] = useState(0);

  const handleGenerateVideo = async (imageRes: any) => {
    // Placeholder - would call server action
    console.log('Generate video for', imageRes);
  };
  const handleDeleteSelectedVideos = () => {
    confirmDelete('Delete Videos', `Delete ${videoResults.filter(v => v.selected).length} videos?`, () => {
      setVideoResults(prev => prev.filter(v => !v.selected));
    });
  };
  const handleDownloadSelectedVideos = () => { /* Implement download logic */ };
  const handleSaveSelectedVideosToProduct = () => { /* Implement save logic */ };
  const toggleVideoSelection = (id: string) => {
    setVideoResults(prev => prev.map(v => (v.id === id || v.tempId === id) ? { ...v, selected: !v.selected } : v));
  };

  const [isModelModalOpen, setIsModelModalOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  const [deleteModal, setDeleteModal] = useState({ open: false, title: '', message: '', onConfirm: () => { } });
  const [errorModal, setErrorModal] = useState({ open: false, title: '', message: '' });
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const [modelParams, setModelParams] = useState({
    gender: 'female', ethnicity: 'caucasian', age: 'young adult', hairColor: 'brown',
    hairLength: 'long', bodyType: 'average', height: 'average', emotion: 'neutral',
    aesthetic: 'ugc-authentic', makeup: 'natural', eyewear: 'none', jewelry: 'minimal', notes: ''
  });
  const [locationParams, setLocationParams] = useState({ setting: 'studio', lighting: 'natural', style: 'modern', notes: '' });
  const [placementParams, setPlacementParams] = useState({
    productCategory: 'cosmetics', material: 'marble', decor: 'minimalist', level: 'eye-level', notes: ''
  });

  // Preset data
  const [presetModels, setPresetModels] = useState<any[]>([]);
  const [presetLocations, setPresetLocations] = useState<any[]>([]);
  const [presetPlacements, setPresetPlacements] = useState<any[]>([]);

  // Refs
  const modelScrollRef = useRef<HTMLDivElement>(null);
  const locationScrollRef = useRef<HTMLDivElement>(null);
  const productsScrollRef = useRef<HTMLDivElement>(null);
  const resultsScrollRef = useRef<HTMLDivElement>(null);
  const videoScrollRef = useRef<HTMLDivElement>(null);

  const scroll = (ref: React.RefObject<HTMLDivElement | null>, direction: 'left' | 'right') => {
    if (ref.current) {
      const scrollAmount = 300;
      ref.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  // Load presets on mount
  useEffect(() => {
    const loadPresets = async () => {
      try {
        const res = await fetch('/api/presets');
        const data = await res.json();
        if (data.models) setPresetModels(data.models);
        if (data.locations) setPresetLocations(data.locations);
        if (data.placements) setPresetPlacements(data.placements);
        if (data.models?.length > 0) setSelectedModel(data.models[0].id);
      } catch (e) {
        console.error('Failed to load presets:', e);
      }
    };
    loadPresets();
  }, []);

  // Check terms
  useEffect(() => {
    const accepted = localStorage.getItem('ugc_terms_accepted');
    if (!accepted) setShowTermsModal(true);
  }, []);

  const confirmDelete = (title: string, message: string, onConfirm: () => void) => {
    setDeleteModal({ open: true, title, message, onConfirm: () => { onConfirm(); setDeleteModal(prev => ({ ...prev, open: false })); } });
  };

  const showError = (title: string, message: string) => {
    setErrorModal({ open: true, title, message });
  };

  const toggleProductSelection = (id: string) => {
    setSelectedProducts(prev => prev.map(p => p.id === id ? { ...p, selected: !p.selected } : p));
  };

  const removeProduct = (id: string) => setSelectedProducts(prev => prev.filter(p => p.id !== id));

  // File upload handlers
  const saveCustomModel = async (files: File[]) => {
    if (files.length === 0) return;
    const file = files[0];
    const reader = new FileReader();
    reader.onload = () => {
      const newModel = { id: `custom-${Date.now()}`, name: file.name, dataUrl: reader.result as string };
      setCustomModels(prev => [newModel, ...prev]);
      setSelectedModel(newModel.id);
    };
    reader.readAsDataURL(file);
  };

  const saveCustomLocation = async (files: File[]) => {
    if (files.length === 0) return;
    const file = files[0];
    const reader = new FileReader();
    reader.onload = () => {
      const newLoc = { id: `custom-${Date.now()}`, name: file.name, dataUrl: reader.result as string };
      if (locationTab === 'placements') {
        setCustomPlacements(prev => [newLoc, ...prev]);
      } else {
        setCustomLocations(prev => [newLoc, ...prev]);
      }
      setSelectedLocation(newLoc.id);
    };
    reader.readAsDataURL(file);
  };

  const deleteCustomModel = (id: string) => {
    setCustomModels(prev => prev.filter(m => m.id !== id));
    if (selectedModel === id) setSelectedModel(presetModels[0]?.id || null);
  };

  const deleteCustomLocation = (id: string) => {
    setCustomLocations(prev => prev.filter(l => l.id !== id));
    setCustomPlacements(prev => prev.filter(l => l.id !== id));
    if (selectedLocation === id) setSelectedLocation('auto');
  };

  const deletePreset = (id: string, e?: any) => {
    e?.stopPropagation();
    setDeletedPresetIds(prev => [...prev, id]);
  };

  // Product picker (placeholder - real implementation would use file upload)
  const selectProducts = () => {
    // For SaaS, we use file upload instead of Shopify resource picker
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files) {
        Array.from(files).forEach((file, idx) => {
          const reader = new FileReader();
          reader.onload = () => {
            const newProduct = {
              id: `product-${Date.now()}-${idx}`,
              title: file.name.replace(/\.[^/.]+$/, ''),
              images: { originalSrc: reader.result as string },
              angleCount: 1,
              selected: true,
              productType: null
            };
            setSelectedProducts(prev => [...prev, newProduct]);
          };
          reader.readAsDataURL(file);
        });
      }
    };
    input.click();
  };

  // Generation
  const startBatchGeneration = async () => {
    const actuallySelectedProducts = selectedProducts.filter(p => p.selected !== false);
    if (actuallySelectedProducts.length === 0) {
      showError('No Products', 'Please select at least one product');
      return;
    }

    const total = actuallySelectedProducts.reduce((sum, p) => sum + (p.angleCount || 1), 0);
    setTotalToGenerate(total);
    setGeneratedCount(0);
    setGenerationProgress(0);
    setIsGenerating(true);

    let generated = 0;

    for (const product of actuallySelectedProducts) {
      const angleCount = product.angleCount || 1;
      for (let angleIndex = 0; angleIndex < angleCount; angleIndex++) {
        const tempId = `temp-${Date.now()}-${Math.random()}`;
        setBatchResults(prev => [{ loading: true, tempId, title: `${product.title} (${angleIndex + 1}/${angleCount})`, productTitle: product.title, selected: false }, ...prev]);

        try {
          const formData = new FormData();
          formData.append('actionType', 'generateBatch');
          formData.append('productData', JSON.stringify([{
            id: product.id,
            title: product.title,
            imageUrl: product.images?.originalSrc || '',
            angleIndex,
            productType: product.productType || productType
          }]));

          const customModel = customModels.find(m => m.id === selectedModel);
          if (customModel?.dataUrl) {
            formData.append('customModelData', customModel.dataUrl);
          } else if (selectedModel) {
            formData.append('presetModelId', selectedModel);
          }

          formData.append('locationId', selectedLocation);
          formData.append('productType', productType);

          const response = await fetch('/api/generate', { method: 'POST', body: formData });
          const result = await response.json();

          if (result?.batchResults?.[0]) {
            const newResult = result.batchResults[0];
            setBatchResults(prev => prev.map(item => item.tempId === tempId ? { ...newResult, imageLoaded: false } : item));
            if (result.credits !== undefined) setCredits(result.credits);
          } else {
            setBatchResults(prev => prev.map(item => item.tempId === tempId ? { ...item, loading: false, error: 'No result', imageUrl: null } : item));
          }
        } catch (error: any) {
          setBatchResults(prev => prev.map(item => item.tempId === tempId ? { ...item, loading: false, error: error.message, imageUrl: null } : item));
        }

        generated++;
        setGeneratedCount(generated);
        setGenerationProgress(Math.round((generated / total) * 100));
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }

    setIsGenerating(false);
  };

  const handleGenerateAsset = async (type: 'model' | 'location' | 'placement') => {
    if (type === 'model') setIsModelModalOpen(false);
    else setIsLocationModalOpen(false);

    const tempId = `temp-${Date.now()}`;
    const placeholder = { id: tempId, name: 'Generating...', dataUrl: null, loading: true };

    if (type === 'model') setCustomModels(prev => [placeholder, ...prev]);
    else if (type === 'placement') setCustomPlacements(prev => [placeholder, ...prev]);
    else setCustomLocations(prev => [placeholder, ...prev]);

    try {
      const formData = new FormData();
      formData.append('actionType', 'generate-asset');
      formData.append('assetType', type);
      formData.append('params', JSON.stringify(type === 'model' ? modelParams : type === 'placement' ? placementParams : locationParams));

      const response = await fetch('/api/generate', { method: 'POST', body: formData });
      const result = await response.json();

      if (result.success && result.asset) {
        const newAsset = { id: result.asset.id, name: result.asset.name, dataUrl: result.asset.imageUrl };
        if (type === 'model') {
          setCustomModels(prev => [newAsset, ...prev.filter(m => m.id !== tempId)]);
          setSelectedModel(result.asset.id);
        } else if (type === 'placement') {
          setCustomPlacements(prev => [newAsset, ...prev.filter(l => l.id !== tempId)]);
          setSelectedLocation(result.asset.id);
        } else {
          setCustomLocations(prev => [newAsset, ...prev.filter(l => l.id !== tempId)]);
          setSelectedLocation(result.asset.id);
        }
        if (result.credits !== undefined) setCredits(result.credits);
      } else {
        throw new Error(result.error || 'Generation failed');
      }
    } catch (error: any) {
      showError('Generation Failed', error.message);
      if (type === 'model') setCustomModels(prev => prev.filter(m => m.id !== tempId));
      else if (type === 'placement') setCustomPlacements(prev => prev.filter(l => l.id !== tempId));
      else setCustomLocations(prev => prev.filter(l => l.id !== tempId));
    }
  };

  const handleDownload = async () => {
    const selected = batchResults.filter(r => r.selected && r.imageUrl);
    if (selected.length === 0) return;

    for (const res of selected) {
      const link = document.createElement('a');
      link.href = res.imageUrl;
      link.download = `${res.productTitle || 'image'}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const deleteSelectedPhotos = () => {
    const toDelete = batchResults.filter(r => r.selected);
    confirmDelete('Delete Photos', `Delete ${toDelete.length} selected photos?`, () => {
      setBatchResults(prev => prev.filter(r => !r.selected));
    });
  };

  return (
    <AppProvider i18n={enTranslations}>
      <DashboardLayout>
        <style>{`
          .model-card {
            width: 150px;
            height: 250px;
            flex: 0 0 150px;
            border-radius: 8px;
            padding: 0;
            text-align: center;
            cursor: pointer;
            background: white;
            border: 1px solid #dfe3e8;
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
            background: white;
            color: #5c5f62;
          }
          .model-card-selected {
            border: 2px solid #008060 !important;
            background: #f1f8f5 !important;
          }
          .full-height-card .Polaris-Card__Section {
            flex: 1;
          }
          .card-scroll-container {
            display: flex;
            gap: 10px;
            overflow-x: auto;
            overflow-y: visible;
            padding-bottom: 10px;
            padding-top: 10px;
            margin-top: 10px;
            scroll-behavior: smooth;
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          .card-scroll-container::-webkit-scrollbar {
            display: none;
          }
          .scroll-btn {
            background: white;
            border: 1px solid #dfe3e8;
            border-radius: 50%;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            z-index: 10;
          }
          .scroll-btn:hover {
            background: #f4f6f8;
          }
          /* Polaris overrides */
          .Polaris-Labelled--hidden {
            height: 100% !important;
          }
          .Polaris-ProgressBar__Indicator.Polaris-ProgressBar__Indicator--appearDone {
            height: 28px!important;
          }
          .Polaris-ProgressBar--toneSuccess {
            height: 28px!important;
          }
          .white-spinner { filter: brightness(0) invert(1); }
          .Polaris-DropZone.Polaris-DropZone--noOutline {
            height: 100% !important;
          }
          .action-card-content:hover { background: #f9fafb; color: #008060; }
          body { background: linear-gradient(180deg, #1e4632 0%, #e3f9e5 100%); min-height: 100vh; background-attachment: fixed; }
          .full-height-card { height: 100%; display: flex; flex-direction: column; }
          /* Force direct child (LegacyCard/Card) to take full height */
          .full-height-card > * { 
            height: 100% !important; 
            display: flex !important; 
            flex-direction: column !important; 
            box-sizing: border-box !important;
          }
          /* Target internal Polaris structure if possible */
          .full-height-card .Polaris-Card__Section { flex: 1; display: flex; flex-direction: column; }
          /* Ensure the div inside Card grows */
          .full-height-card > * > div { flex: 1; display: flex; flex-direction: column; height: 100%; min-height: 0; }
          
          /* Keyframes for animations */
          @keyframes fabSlideUp {
            from { opacity: 0; transform: translateY(20px) scale(0.95); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
          .generate-btn-wrapper button {
            background: #008060!important;
            color: white!important;
            border: none!important;
            box-shadow: none!important;
          }
          .generate-btn-wrapper button:hover {
            background: #006e52!important;
          }
          .generate-btn-wrapper button:disabled {
            background: #ccc!important;
            color: #666!important;
          }
          .model-card:hover {border-color: #008060; transform: translateY(-2px); transition: all 0.2s; }
          .model-card-selected {border: 2px solid #008060; }
          .model-img {width: 100%; height: 215px; object-fit: cover; }
          .model-text {height: 35px; display: flex; align-items: center; justify-content: center; padding: 0 4px; }
          .action-card-content {
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 20px;
            text-align: center;
            gap: 4px;
          }
          .scroll-btn {
            background: #f9fafb;
            border: 1px solid #e1e3e5;
            border-radius: 4px;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            font-size: 16px;
            user-select: none;
          }
          .scroll-btn:hover {
            background: #f4f6f8;
            border-color: #c9cccf;
          }
          .card-scroll-container {
            display: flex;
            gap: 16px;
            overflow-x: auto;
            overflow-y: hidden;
            padding: 16px 0;
            scroll-behavior: smooth;
            -webkit-overflow-scrolling: touch;
          }
          .card-scroll-container::-webkit-scrollbar {
            height: 8px;
          }
          .card-scroll-container::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 10px;
          }
          .card-scroll-container::-webkit-scrollbar-thumb {
            background: #888;
            border-radius: 10px;
          }
          .card-scroll-container::-webkit-scrollbar-thumb:hover {
            background: #555;
          }
          .white-spinner {filter: brightness(0) invert(1); }
          .Polaris-DropZone.Polaris-DropZone--noOutline {
            height: 100% !important;
          }
          .action-card-content:hover {background: #f9fafb; color: #008060; }
          .full-height-card {height: 100%; display: flex; flex-direction: column; }
          .full-height-card > * {
            height: 100% !important;
            display: flex !important;
            flex-direction: column !important;
            box-sizing: border-box !important;
          }
          .full-height-card .Polaris-Card__Section {flex: 1; display: flex; flex-direction: column; }
          .full-height-card > * > div {flex: 1; display: flex; flex-direction: column; height: 100%; min-height: 0; }
          @keyframes fabSlideUp {
            from {transform: translate(-50%, 100px); opacity: 0; }
            to {transform: translate(-50%, 0); opacity: 1; }
          }
          .Polaris-Button--variantPrimary:not(.Polaris-Button--disabled) {
            background: #008060 !important;
            border-color: #008060 !important;
            color: white !important;
          }
          .Polaris-Button--variantPrimary:not(.Polaris-Button--disabled):hover {
            background: #006e52 !important;
          }
          .Polaris-Button--disabled {
            background: #f1f1f1 !important;
            border-color: #e1e3e5 !important;
            color: #8c9196 !important;
            opacity: 0.6;
          }
          .generate-btn-text {
            font-weight: 600;
            letter-spacing: 0.3px;
          }
        `}</style>

        <Page fullWidth>
          <Layout>
            {/* Header Cards */}
            <Layout.Section>
              <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', alignItems: 'stretch' }}>
                <div style={{ flex: 1 }}>
                  <div className="full-height-card">
                    <Card>
                      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <Text variant="headingMd" as="h2">Product Type</Text>
                        <div style={{ marginTop: '10px' }}>
                          <InlineStack gap="200">
                            {['auto', 'clothing', 'item'].map(t => (
                              <Button key={t} pressed={productType === t} onClick={() => setProductType(t)}>
                                {t === 'auto' ? 'Auto' : t === 'clothing' ? 'Clothing' : 'Item'}
                              </Button>
                            ))}
                          </InlineStack>
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <div className="full-height-card">
                    <Card>
                      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <InlineStack align="space-between" blockAlign="center">
                          <Text variant="headingMd" as="h2">Credits</Text>
                          <Badge tone={credits > 0 ? "success" : "critical"}>{credits} Available</Badge>
                        </InlineStack>
                        <div style={{ marginTop: '10px' }}>
                          <ProgressBar progress={Math.min(100, credits)} tone="success" />
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>
              </div>
            </Layout.Section>

            {/* Products Section */}
            <Layout.Section>
              <Card>
                <InlineStack align="space-between" blockAlign="center">
                  <Text variant="headingMd" as="h2">Select Products to Generate UGC Photos ({selectedProducts.filter(p => p.selected !== false).length} selected / {selectedProducts.length} total)</Text>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    {selectedProducts.length > 0 && (
                      <Button
                        onClick={() => confirmDelete('Remove All', 'Are you sure you want to remove all selected products?', () => setSelectedProducts([]))}
                      >
                        Delete {selectedProducts.length} Products
                      </Button>
                    )}
                    <div style={{ display: 'flex', gap: '5px' }}>
                      <div className="scroll-btn" onClick={() => scroll(productsScrollRef, 'left')}>←</div>
                      <div className="scroll-btn" onClick={() => scroll(productsScrollRef, 'right')}>→</div>
                    </div>
                  </div>
                </InlineStack>
                <div style={{ overflow: 'visible' }}>
                  <div className="card-scroll-container" ref={productsScrollRef}>
                    {/* Select Product Card */}
                    <div className="model-card" onClick={selectProducts}>
                      <div className="action-card-content">
                        <div style={{ fontSize: '32px', marginBottom: '4px' }}>+</div>
                        <Text variant="bodyMd" fontWeight="medium">Select Product</Text>
                      </div>
                    </div>

                    {selectedProducts.map(p => (
                      <div
                        key={p.id}
                        className={p.selected !== false ? "model-card model-card-selected" : "model-card"}
                        style={{ cursor: 'pointer', position: 'relative' }}
                        onClick={() => toggleProductSelection(p.id)}
                      >
                        <Tooltip content="Select number of angles (photos)">
                          <div style={{ position: 'absolute', top: '5px', left: '0', right: '0', display: 'flex', justifyContent: 'center', gap: '2px' }}>
                            {[1, 2, 3].map(n => (
                              <button
                                key={n}
                                onClick={(e) => { e.stopPropagation(); setSelectedProducts(curr => curr.map(x => x.id === p.id ? { ...x, angleCount: n } : x)); }}
                                style={{
                                  background: (p.angleCount || 1) === n ? '#008060' : 'rgba(255,255,255,0.8)',
                                  color: (p.angleCount || 1) === n ? 'white' : 'black',
                                  border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer', width: '20px', height: '20px', fontSize: '12px'
                                }}
                              >
                                {n}
                              </button>
                            ))}
                          </div>
                        </Tooltip>
                        <img src={p.images?.originalSrc} className="model-img" />

                        <div className="model-text">
                          <Text truncate variant="bodySm">{p.title}</Text>
                        </div>

                        <div style={{ position: 'absolute', bottom: '40px', left: '0', right: '0', display: 'flex', justifyContent: 'center', gap: '8px' }}>
                          <Tooltip content="Preview">
                            <Button plain icon={MaximizeIcon} onClick={(e) => { e.stopPropagation(); setPreviewImage({ src: p.images?.originalSrc, title: p.title }); }} />
                          </Tooltip>
                          <Tooltip content="Remove">
                            <Button plain icon={DeleteIcon} onClick={(e) => {
                              e.stopPropagation();
                              confirmDelete('Remove Product', 'Are you sure?', () => removeProduct(p.id));
                            }} />
                          </Tooltip>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>

            </Layout.Section>

            {/* Models and Locations */}
            <Layout.Section>
              <div style={{ display: 'flex', gap: '20px', alignItems: 'stretch' }}>
                {/* MODEL - 50% */}
                <div className="full-height-card" style={{ flex: 1, overflow: 'hidden' }}>
                  <Card>
                    <div style={{ overflow: 'hidden', position: 'relative' }}>
                      <InlineStack align="space-between" blockAlign="center">
                        <Text variant="headingMd" as="h2">Select / Generate / Upload UGC Model</Text>
                        <div style={{ display: 'flex', gap: '5px' }}>
                          <div className="scroll-btn" onClick={() => scroll(modelScrollRef, 'left')}>←</div>
                          <div className="scroll-btn" onClick={() => scroll(modelScrollRef, 'right')}>→</div>
                        </div>
                      </InlineStack>
                      <div className="card-scroll-container" ref={modelScrollRef}>
                        {/* Upload Button */}
                        <div className="model-card" onClick={() => { }}>
                          <DropZone onDrop={(_f, accepted) => accepted.length > 0 && saveCustomModel(accepted)} allowMultiple={false} accept="image/*" outline={false}>
                            <div className="action-card-content" style={{ padding: '0 10px' }}>
                              <div style={{ fontSize: '32px', marginBottom: '4px' }}>+</div>
                              <Text variant="bodyMd" fontWeight="medium">Upload Photo</Text>
                              <div style={{ display: 'none' }}><DropZone.FileUpload /></div>
                            </div>
                          </DropZone>
                        </div>

                        {/* Create Button */}
                        <div className="model-card" onClick={() => setIsModelModalOpen(true)}>
                          <div className="action-card-content">
                            <div style={{ fontSize: '32px', marginBottom: '4px' }}>✨</div>
                            <Text variant="bodyMd" fontWeight="medium">Create New</Text>
                          </div>
                        </div>

                        {/* No Model Option (Synced with Placements Tab) */}
                        <div
                          onClick={() => {
                            setSelectedModel('no-model');
                            setLocationTab('placements');
                          }}
                          className={`model-card ${selectedModel === 'no-model' ? 'model-card-selected' : ''}`}
                          style={{
                            backgroundColor: '#f6f6f7',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            padding: '10px',
                            textAlign: 'center',
                            gap: '8px',
                            border: selectedModel === 'no-model' ? '3px solid #008060' : '1px solid #e1e3e5',
                          }}
                        >
                          <div style={{ fontSize: '32px' }}>📦</div>
                          <Text variant="bodySm" fontWeight="bold">No Model</Text>
                          <Text variant="bodyXs" tone="subdued">(Still Life)</Text>
                        </div>

                        {/* Custom Models Loop */}
                        {isLoadingData && customModels.length === 0 && (
                          <div className="model-card">
                            <div className="action-card-content">
                              <Spinner size="small" />
                            </div>
                          </div>
                        )}

                        {/* Custom Models */}
                        {customModels.map((model) => {
                          if (model.loading) {
                            return (
                              <div key={model.id} className="model-card">
                                <div className="action-card-content">
                                  <Spinner size="small" />
                                  <Text variant="bodySm">Loading...</Text>
                                </div>
                              </div>
                            );
                          }
                          return (
                            <div
                              key={model.id}
                              className={`model-card ${selectedModel === model.id ? 'model-card-selected' : ''}`}
                              onClick={() => setSelectedModel(model.id)}
                            >
                              <img src={model.dataUrl} className="model-img" />
                              <div className="model-text">
                                <Text variant="bodySm" truncate>{model.name}</Text>
                              </div>
                              <div style={{ position: 'absolute', bottom: '40px', left: '0', right: '0', display: 'flex', justifyContent: 'center', gap: '8px' }}>
                                <Tooltip content="Preview">
                                  <Button
                                    plain
                                    icon={MaximizeIcon}
                                    onClick={(e) => { e.stopPropagation(); setPreviewImage({ src: model.dataUrl, title: model.name }); }}
                                  />
                                </Tooltip>
                                <Tooltip content="Delete">
                                  <Button
                                    plain
                                    icon={DeleteIcon}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      confirmDelete('Delete Model', 'Are you sure you want to delete this model?', () => deleteCustomModel(model.id));
                                    }}
                                  />
                                </Tooltip>
                              </div>
                            </div>
                          );
                        })}

                        {/* Preset Models */}
                        {presetModels?.filter(m => !deletedPresetIds.includes(m.id)).map((model) => (
                          <div
                            key={model.id}
                            className={`model-card ${selectedModel === model.id ? 'model-card-selected' : ''}`}
                            onClick={() => setSelectedModel(model.id)}
                          >
                            <img src={model.image} className="model-img" />
                            <div className="model-text">
                              <Text variant="bodySm" truncate>{model.name}</Text>
                            </div>
                            <div style={{ position: 'absolute', bottom: '40px', left: '0', right: '0', display: 'flex', justifyContent: 'center', gap: '8px' }}>
                              <Tooltip content="Preview">
                                <Button
                                  plain
                                  icon={MaximizeIcon}
                                  onClick={(e) => { e.stopPropagation(); setPreviewImage({ src: model.image, title: model.name }); }}
                                />
                              </Tooltip>
                              <Tooltip content="Hide">
                                <Button
                                  plain
                                  icon={DeleteIcon}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    confirmDelete('Hide Model', 'Are you sure you want to hide this preset model?', () => deletePreset(model.id, e));
                                  }}
                                />
                              </Tooltip>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card>
                </div>

                {/* LOCATION - 50% */}
                <div className="full-height-card" style={{ flex: 1, overflow: 'hidden' }}>
                  <Card>
                    <div style={{ overflow: 'hidden', position: 'relative' }}>
                      <InlineStack align="space-between" blockAlign="center">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <Text variant="headingMd" as="h2">Background Location</Text>
                          {/* Toggle Tabs */}
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <div
                              onClick={() => setLocationTab('locations')}
                              style={{
                                padding: '4px 12px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                background: locationTab === 'locations' ? '#f1f8f5' : 'transparent',
                                border: locationTab === 'locations' ? '1px solid #008060' : '1px solid transparent',
                                color: locationTab === 'locations' ? '#008060' : '#5c5f62',
                                fontWeight: locationTab === 'locations' ? '600' : '400',
                                fontSize: '13px'
                              }}
                            >
                              Locations
                            </div>
                            <div
                              onClick={() => { setLocationTab('placements'); setSelectedModel('no-model'); }}
                              style={{
                                padding: '4px 12px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                background: locationTab === 'placements' ? '#f1f8f5' : 'transparent',
                                border: locationTab === 'placements' ? '1px solid #008060' : '1px solid transparent',
                                color: locationTab === 'placements' ? '#008060' : '#5c5f62',
                                fontWeight: locationTab === 'placements' ? '600' : '400',
                                fontSize: '13px'
                              }}
                            >
                              Placements
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '5px' }}>
                          <div className="scroll-btn" onClick={() => scroll(locationScrollRef, 'left')}>←</div>
                          <div className="scroll-btn" onClick={() => scroll(locationScrollRef, 'right')}>→</div>
                        </div>
                      </InlineStack>
                      <div className="card-scroll-container" ref={locationScrollRef}>
                        {/* Upload Button */}
                        <div className="model-card" onClick={() => { }}>
                          <DropZone onDrop={(_f, accepted) => accepted.length > 0 && saveCustomLocation(accepted)} allowMultiple={false} accept="image/*" outline={false}>
                            <div className="action-card-content">
                              <div style={{ fontSize: '32px', marginBottom: '4px' }}>+</div>
                              <Text variant="bodyMd" fontWeight="medium">Upload Photo</Text>
                              <div style={{ display: 'none' }}><DropZone.FileUpload /></div>
                            </div>
                          </DropZone>
                        </div>

                        {/* Create Button */}
                        <div className="model-card" onClick={() => setIsLocationModalOpen(true)}>
                          <div className="action-card-content">
                            <div style={{ fontSize: '32px', marginBottom: '4px' }}>✨</div>
                            <Text variant="bodyMd" fontWeight="medium">Create New</Text>
                          </div>
                        </div>

                        {/* Auto-Select Card */}
                        <div
                          className={`model-card ${selectedLocation === 'auto' ? 'model-card-selected' : ''}`}
                          onClick={() => setSelectedLocation('auto')}
                          style={{
                            background: selectedLocation === 'auto' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#f9fafb',
                            color: selectedLocation === 'auto' ? 'white' : 'inherit',
                            border: selectedLocation === 'auto' ? '2px solid #008060' : '1px solid #e1e3e5'
                          }}
                        >
                          <div className="action-card-content">
                            <div style={{ fontSize: '32px', marginBottom: '4px' }}>🤖</div>
                            <Text variant="bodyMd" fontWeight="medium" contrast={selectedLocation === 'auto'}>Auto-select best {locationTab === 'placements' ? 'placement' : 'location'}</Text>
                          </div>
                        </div>

                        {/* Loading Custom Locations */}
                        {isLoadingData && (locationTab === 'locations' ? customLocations : customPlacements).length === 0 && (
                          <div className="model-card">
                            <div className="action-card-content">
                              <Spinner size="small" />
                            </div>
                          </div>
                        )}

                        {/* Custom Locations/Placements */}
                        {(locationTab === 'locations' ? customLocations : customPlacements).map((loc) => {
                          if (loc.loading) {
                            return (
                              <div key={loc.id} className="model-card">
                                <div className="action-card-content">
                                  <Spinner size="small" />
                                  <Text variant="bodySm">Loading...</Text>
                                </div>
                              </div>
                            );
                          }
                          return (
                            <div
                              key={loc.id}
                              className={`model-card ${selectedLocation === loc.id ? 'model-card-selected' : ''}`}
                              onClick={() => setSelectedLocation(loc.id)}
                            >
                              <img src={loc.dataUrl} className="model-img" />
                              <div className="model-text">
                                <Text variant="bodySm" truncate>{loc.name}</Text>
                              </div>
                              <div style={{ position: 'absolute', bottom: '40px', left: '0', right: '0', display: 'flex', justifyContent: 'center', gap: '8px' }}>
                                <Tooltip content="Preview">
                                  <Button
                                    plain
                                    icon={MaximizeIcon}
                                    onClick={(e) => { e.stopPropagation(); setPreviewImage({ src: loc.dataUrl, title: loc.name }); }}
                                  />
                                </Tooltip>
                                <Tooltip content="Delete">
                                  <Button
                                    plain
                                    icon={DeleteIcon}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      confirmDelete('Delete Location', 'Are you sure you want to delete this location?', () => deleteCustomLocation(loc.id));
                                    }}
                                  />
                                </Tooltip>
                              </div>
                            </div>
                          );
                        })}

                        {/* Preset Locations */}
                        {/* Preset Locations/Placements */}
                        {(locationTab === 'locations' ? presetLocations : presetPlacements)?.filter(l => !deletedPresetIds.includes(l.id)).map((loc) => (
                          <div
                            key={loc.id}
                            className={`model-card ${selectedLocation === loc.id ? 'model-card-selected' : ''}`}
                            onClick={() => setSelectedLocation(loc.id)}
                          >
                            <img src={loc.image} className="model-img" />
                            <div className="model-text">
                              <Text variant="bodySm" truncate>{loc.name}</Text>
                            </div>
                            <div style={{ position: 'absolute', bottom: '40px', left: '0', right: '0', display: 'flex', justifyContent: 'center', gap: '8px' }}>
                              <Tooltip content="Preview">
                                <Button
                                  plain
                                  icon={MaximizeIcon}
                                  onClick={(e) => { e.stopPropagation(); setPreviewImage({ src: loc.image, title: loc.name }); }}
                                />
                              </Tooltip>
                              <Tooltip content="Hide">
                                <Button
                                  plain
                                  icon={DeleteIcon}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    confirmDelete('Hide Location', 'Are you sure you want to hide this preset location?', () => deletePreset(loc.id, e));
                                  }}
                                />
                              </Tooltip>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </Layout.Section>

            {/* Results */}
            <Layout.Section>
              <div className="full-height-card" style={{ flex: 1, minWidth: '300px' }}>
                <Card>
                  <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <InlineStack align="space-between">
                      <Text variant="headingMd" as="h2">Results ({batchResults.length})</Text>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {batchResults.some(r => r.selected) && (
                          <>
                            <Button onClick={deleteSelectedPhotos} size="micro" tone="critical">Delete ({batchResults.filter(r => r.selected).length})</Button>
                            <Button onClick={handleDownload} size="micro">Download ({batchResults.filter(r => r.selected).length})</Button>
                          </>
                        )}
                        <div style={{ display: 'flex', gap: '5px' }}>
                          <div className="scroll-btn" onClick={() => scroll(resultsScrollRef, 'left')}>←</div>
                          <div className="scroll-btn" onClick={() => scroll(resultsScrollRef, 'right')}>→</div>
                        </div>
                      </div>
                    </InlineStack>
                    {isGenerating && (
                      <Box paddingBlockStart="400">
                        <ProgressBar progress={generationProgress} tone="success" />
                        <Text variant="bodySm" tone="subdued" alignment="center">Generating {generatedCount} of {totalToGenerate}...</Text>
                      </Box>
                    )}
                    <div className="card-scroll-container" ref={resultsScrollRef} style={{ minHeight: '280px' }}>
                      {batchResults.length === 0 && (
                        <div className="model-card">
                          <div className="action-card-content">
                            <div style={{ fontSize: '32px', marginBottom: '4px' }}>📸</div>
                            <Text variant="bodyMd" fontWeight="medium">Generate Photos</Text>
                          </div>
                        </div>
                      )}
                      {batchResults.map((res, idx) => res.loading ? (
                        <div key={res.tempId} className="model-card">
                          <div style={{ width: '100%', height: '215px', background: '#f4f4f4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Spinner size="large" />
                          </div>
                          <div className="model-text"><Text variant="bodySm">{res.title}</Text></div>
                        </div>
                      ) : (
                        <div key={res.id || idx} className={`model-card ${res.selected ? 'model-card-selected' : ''}`} onClick={() => { if (res.imageUrl) { const updated = [...batchResults]; updated[idx].selected = !updated[idx].selected; setBatchResults(updated); } }}>
                          <div style={{ width: '100%', height: '215px', background: '#f4f4f4', overflow: 'hidden', position: 'relative' }}>
                            {res.imageUrl ? (
                              <img src={res.imageUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" onLoad={() => setBatchResults(prev => prev.map(item => item.id === res.id ? { ...item, imageLoaded: true } : item))} />
                            ) : (
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', background: '#fff4f4' }}>
                                <Text variant="bodySm" tone="critical">Failed</Text>
                                <Text variant="bodyXs" tone="subdued">{res.error}</Text>
                              </div>
                            )}
                          </div>
                          <div className="model-text"><Text variant="bodySm" truncate>{res.productTitle}</Text></div>
                          {res.imageUrl && (
                            <div style={{ position: 'absolute', bottom: '40px', left: '0', right: '0', display: 'flex', justifyContent: 'center', gap: '6px' }}>
                              <Tooltip content="Preview"><Button plain icon={MaximizeIcon} onClick={(e) => { e.stopPropagation(); setPreviewImage({ src: res.imageUrl, title: res.productTitle }); }} /></Tooltip>
                              <Tooltip content="Download"><Button plain icon={SaveIcon} onClick={(e) => { e.stopPropagation(); const link = document.createElement('a'); link.href = res.imageUrl; link.download = `${res.productTitle}.jpg`; link.click(); }} /></Tooltip>
                              <Tooltip content="Delete"><Button plain icon={DeleteIcon} onClick={(e) => { e.stopPropagation(); confirmDelete('Delete', 'Delete this image?', () => setBatchResults(prev => prev.filter(r => r.id !== res.id))); }} /></Tooltip>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              </div>
            </Layout.Section>

            {/* VIDEOS */}
            <Layout.Section>
              <div className="full-height-card" style={{ flex: 1, minWidth: '300px' }}>
                <Card>
                  <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <InlineStack align="space-between" blockAlign="center">
                      <Text variant="headingMd" as="h2">Video Results ({videoResults.length})</Text>

                      <InlineStack gap="200" align="end">
                        {videoResults.some(v => v.selected) && (
                          <div style={{ display: 'flex', gap: '8px', paddingLeft: '8px', borderLeft: '1px solid #eee' }}>
                            <Button size="micro" tone="critical" onClick={handleDeleteSelectedVideos}>Delete ({videoResults.filter(v => v.selected).length})</Button>
                            <Button size="micro" onClick={handleDownloadSelectedVideos}>Download ({videoResults.filter(v => v.selected).length})</Button>
                            <Button size="micro" onClick={handleSaveSelectedVideosToProduct}>Save to products ({videoResults.filter(v => v.selected).length})</Button>
                          </div>
                        )}

                        <div style={{ display: 'flex', gap: '5px', paddingLeft: '8px', borderLeft: '1px solid #eee' }}>
                          <div className="scroll-btn" onClick={() => scroll(videoScrollRef, 'left')}>←</div>
                          <div className="scroll-btn" onClick={() => scroll(videoScrollRef, 'right')}>→</div>
                        </div>
                      </InlineStack>
                    </InlineStack>

                    {isVideoGenerating && (
                      <Box width="100%" paddingBlockStart="200" paddingBlockEnd="200">
                        <ProgressBar progress={videoProgress} tone="success" />
                        <Text variant="bodySm" tone="subdued" alignment="center">
                          Generating {generatedVideoCount} of {totalVideoCount} videos...
                        </Text>
                      </Box>
                    )}

                    <div className="card-scroll-container" ref={videoScrollRef} style={{ minHeight: '280px' }}>
                      {videoResults.length === 0 && (
                        <div className="model-card">
                          <div className="action-card-content">
                            <div style={{ fontSize: '32px', marginBottom: '4px' }}>🎬</div>
                            <Text variant="bodyMd" fontWeight="medium">No videos generated yet</Text>
                          </div>
                        </div>
                      )}

                      {videoResults.map((v, idx) => {
                        if (v.loading && !v.videoUrl) {
                          return (
                            <div key={v.tempId || idx} className="model-card">
                              <div style={{ width: '100%', height: '215px', background: '#000', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {v.imageUrl ? (
                                  <>
                                    <img
                                      src={v.imageUrl}
                                      alt=""
                                      style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.4 }}
                                    />
                                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                      <div className="white-spinner"><Spinner size="large" /></div>
                                    </div>
                                  </>
                                ) : (
                                  <div className="white-spinner"><Spinner size="large" /></div>
                                )}
                              </div>
                              <div className="model-text">
                                <Text variant="bodySm" truncate>{v.productTitle}</Text>
                              </div>
                            </div>
                          );
                        }

                        return (
                          <div
                            key={v.id || v.tempId || idx}
                            className={`model-card ${v.selected ? 'model-card-selected' : ''}`}
                            onClick={(e) => {
                              if ((e.target as HTMLElement).closest('button')) return;
                              toggleVideoSelection(v.id || v.tempId);
                            }}
                          >
                            <div
                              style={{ width: '100%', height: '215px', background: '#000', position: 'relative', overflow: 'hidden' }}
                              onMouseEnter={(e) => {
                                const video = e.currentTarget.querySelector('video');
                                if (video) video.play().catch(() => { });
                              }}
                              onMouseLeave={(e) => {
                                const video = e.currentTarget.querySelector('video');
                                if (video) video.pause();
                              }}
                            >
                              {/* Video Player */}
                              {v.videoUrl ? (
                                <video
                                  src={v.videoUrl}
                                  style={{ width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none' }}
                                  playsInline
                                  muted
                                  loop
                                />
                              ) : (
                                v.imageUrl && (
                                  <img
                                    src={v.imageUrl}
                                    alt=""
                                    style={{
                                      position: 'absolute',
                                      inset: 0,
                                      width: '100%',
                                      height: '100%',
                                      objectFit: 'cover',
                                      opacity: 0.6
                                    }}
                                  />
                                )
                              )}

                              {/* Error State */}
                              {v.status === 'FAILED' && (
                                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#1a0000', color: '#ffaaaa', padding: '15px', textAlign: 'center', zIndex: 10 }}>
                                  <Text variant="bodySm" fontWeight="bold">Generation Failed</Text>
                                  <div style={{ marginTop: '8px', fontSize: '11px', lineHeight: '1.2' }}>
                                    {v.error || 'Server error'}
                                  </div>
                                </div>
                              )}
                            </div>

                            <div className="model-text">
                              <Text variant="bodySm" truncate>{v.productTitle}</Text>
                            </div>

                            <div style={{ position: 'absolute', bottom: '40px', left: '0', right: '0', display: 'flex', justifyContent: 'center', gap: '6px' }}>
                              <Tooltip content="Maximize">
                                <Button
                                  plain
                                  icon={MaximizeIcon}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setPreviewImage({ src: v.videoUrl, title: v.productTitle, type: 'video' });
                                  }}
                                />
                              </Tooltip>
                              <Tooltip content="Play">
                                <Button
                                  plain
                                  icon={PlayIcon}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const video = e.currentTarget.closest('.model-card').querySelector('video');
                                    if (video) video.play();
                                  }}
                                />
                              </Tooltip>
                              <Tooltip content="Download">
                                <Button
                                  plain
                                  icon={SaveIcon}
                                  disabled={!v.videoUrl}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (!v.videoUrl) return;
                                    const link = document.createElement('a');
                                    link.href = v.videoUrl;
                                    link.download = `video-${v.id || idx}.mp4`;
                                    document.body.appendChild(link);
                                    link.click();
                                    document.body.removeChild(link);
                                  }}
                                />
                              </Tooltip>
                              <Tooltip content="Delete">
                                <Button
                                  plain
                                  icon={DeleteIcon}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    confirmDelete('Delete Video', 'Are you sure?', () => {
                                      if (v.id) {
                                        // TODO: Implement video delete API
                                        setVideoResults(prev => prev.filter(x => x.id !== v.id));
                                      } else {
                                        setVideoResults(prev => prev.filter(x => x.tempId !== v.tempId));
                                      }
                                    });
                                  }}
                                />
                              </Tooltip>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </Card>
              </div>
            </Layout.Section>
          </Layout>
        </Page >

        {/* Floating Action Bar */}
        {/* Sticky Floating Action Bar */}
        {
          (selectedProducts.some(p => p.selected !== false) || batchResults.some(r => r.selected)) && (
            <div style={{
              position: 'fixed',
              bottom: '24px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 1000,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(12px)',
              padding: '12px 24px',
              borderRadius: '100px',
              boxShadow: '0 20px 50px rgba(0, 128, 96, 0.15)',
              border: '2px solid #008060',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              animation: 'fabSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingRight: '16px', borderRight: '1px solid rgba(0,0,0,0.1)' }}>
                <Badge tone="success">Ready to Generate</Badge>
              </div>

              <InlineStack gap="400">
                <Button
                  onClick={startBatchGeneration}
                  loading={isGenerating}
                  disabled={isGenerating || !selectedProducts.some(p => p.selected !== false)}
                  size="large"
                  variant="primary"
                >
                  <span className="generate-btn-text">
                    {isGenerating ? 'Generating Photos...' : `Generate Photos (${selectedProducts.filter(p => p.selected !== false).reduce((sum, p) => sum + (p.angleCount || 1), 0)})`}
                  </span>
                </Button>

                <Button
                  onClick={handleGenerateVideo}
                  loading={isVideoGenerating}
                  disabled={isVideoGenerating || !batchResults.some(p => p.selected)}
                  icon={PlayIcon}
                  size="large"
                  variant="primary"
                >
                  <span className="generate-btn-text">
                    {isVideoGenerating ? 'Generating Videos...' : `Generate Videos (${batchResults.filter(p => p.selected).length})`}
                  </span>
                </Button>
              </InlineStack>
            </div>
          )
        }

        {/* Preview Modal */}
        {
          previewImage && (
            <Modal open={!!previewImage} onClose={() => setPreviewImage(null)} title={previewImage.title} size="large">
              <Modal.Section>
                <div style={{ display: 'flex', justifyContent: 'center', background: '#f4f4f4', padding: '20px' }}>
                  <img src={previewImage.src} style={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain', borderRadius: '8px' }} alt="Preview" />
                </div>
              </Modal.Section>
            </Modal>
          )
        }

        {/* Model Generation Modal */}
        <Modal open={isModelModalOpen} onClose={() => setIsModelModalOpen(false)} title="Generate Custom Model" primaryAction={{ content: 'Generate (1 Credit)', onAction: () => handleGenerateAsset('model') }} secondaryActions={[{ content: 'Cancel', onAction: () => setIsModelModalOpen(false) }]}>
          <Modal.Section>
            <BlockStack gap="400">
              <OptionGrid label="Gender" options={[{ value: 'female', label: 'Female', icon: '👩' }, { value: 'male', label: 'Male', icon: '👨' }]} selected={modelParams.gender} onChange={(v) => setModelParams({ ...modelParams, gender: v })} />
              <OptionGrid label="Ethnicity" options={[{ value: 'caucasian', label: 'Caucasian', icon: '🌍' }, { value: 'asian', label: 'Asian', icon: '🌏' }, { value: 'black', label: 'Black', icon: '🌍' }, { value: 'hispanic', label: 'Hispanic', icon: '🌎' }]} selected={modelParams.ethnicity} onChange={(v) => setModelParams({ ...modelParams, ethnicity: v })} />
              <OptionGrid label="Age" options={[{ value: 'young adult', label: 'Young Adult', icon: '👱' }, { value: 'adult', label: 'Adult', icon: '👩' }, { value: 'middle aged', label: 'Middle', icon: '👵' }]} selected={modelParams.age} onChange={(v) => setModelParams({ ...modelParams, age: v })} />
              <OptionGrid label="Hair Color" options={[{ value: 'blonde', label: 'Blonde', icon: '👱‍♀️' }, { value: 'brown', label: 'Brown', icon: '👩' }, { value: 'black', label: 'Black', icon: '👧' }, { value: 'red', label: 'Red', icon: '👩‍🦰' }]} selected={modelParams.hairColor} onChange={(v) => setModelParams({ ...modelParams, hairColor: v })} />
              <TextField label="Additional Details" value={modelParams.notes} onChange={(v) => setModelParams({ ...modelParams, notes: v })} placeholder="e.g. curly hair, blue eyes" multiline={2} autoComplete="off" />
            </BlockStack>
          </Modal.Section>
        </Modal>

        {/* Location Generation Modal */}
        <Modal open={isLocationModalOpen} onClose={() => setIsLocationModalOpen(false)} title={locationTab === 'placements' ? "Generate Placement" : "Generate Location"} primaryAction={{ content: 'Generate', onAction: () => handleGenerateAsset(locationTab === 'placements' ? 'placement' : 'location') }} secondaryActions={[{ content: 'Cancel', onAction: () => setIsLocationModalOpen(false) }]}>
          <Modal.Section>
            {locationTab === 'placements' ? (
              <BlockStack gap="400">
                <OptionGrid label="Product Category" options={[{ value: 'cosmetics', label: 'Cosmetics', icon: '💄' }, { value: 'skincare', label: 'Skincare', icon: '🧴' }, { value: 'jewelry', label: 'Jewelry', icon: '💎' }, { value: 'perfume', label: 'Perfume', icon: '🌬️' }]} selected={placementParams.productCategory} onChange={(v) => setPlacementParams({ ...placementParams, productCategory: v })} />
                <OptionGrid label="Material" options={[{ value: 'marble', label: 'Marble', icon: '⚪' }, { value: 'wood', label: 'Wood', icon: '🪵' }, { value: 'concrete', label: 'Concrete', icon: '🏗️' }, { value: 'velvet', label: 'Velvet', icon: '🧣' }]} selected={placementParams.material} onChange={(v) => setPlacementParams({ ...placementParams, material: v })} />
              </BlockStack>
            ) : (
              <BlockStack gap="400">
                <OptionGrid label="Setting" options={[{ value: 'modern-interior', label: 'Modern', icon: '🏠' }, { value: 'luxury-bathroom', label: 'Bathroom', icon: '🛁' }, { value: 'outdoor-nature', label: 'Nature', icon: '🌳' }, { value: 'urban-street', label: 'Urban', icon: '🏙️' }]} selected={locationParams.setting} onChange={(v) => setLocationParams({ ...locationParams, setting: v })} />
                <OptionGrid label="Lighting" options={[{ value: 'soft-natural', label: 'Natural', icon: '☀️' }, { value: 'dramatic-studio', label: 'Studio', icon: '💡' }, { value: 'golden-hour', label: 'Golden', icon: '🌇' }]} selected={locationParams.lighting} onChange={(v) => setLocationParams({ ...locationParams, lighting: v })} />
              </BlockStack>
            )}
          </Modal.Section>
        </Modal>

        {/* Delete Modal */}
        <Modal open={deleteModal.open} onClose={() => setDeleteModal(prev => ({ ...prev, open: false }))} title={deleteModal.title} primaryAction={{ content: 'Delete', destructive: true, onAction: deleteModal.onConfirm }} secondaryActions={[{ content: 'Cancel', onAction: () => setDeleteModal(prev => ({ ...prev, open: false })) }]}>
          <Modal.Section><Text>{deleteModal.message}</Text></Modal.Section>
        </Modal>

        {/* Error Modal */}
        <Modal open={errorModal.open} onClose={() => setErrorModal(prev => ({ ...prev, open: false }))} title={errorModal.title} primaryAction={{ content: 'Close', onAction: () => setErrorModal(prev => ({ ...prev, open: false })) }}>
          <Modal.Section><Text>{errorModal.message}</Text></Modal.Section>
        </Modal>

        {/* Terms Modal */}
        <Modal open={showTermsModal} onClose={() => { }} title="AI Usage Policy" primaryAction={{ content: 'I Accept', onAction: () => { if (termsAccepted) { localStorage.setItem('ugc_terms_accepted', 'true'); setShowTermsModal(false); } }, disabled: !termsAccepted }}>
          <Modal.Section>
            <BlockStack gap="400">
              <Text>By using UGC Studio, you agree to our AI usage policy. Generated content must comply with all applicable laws and guidelines.</Text>
              <Checkbox label="I accept the terms" checked={termsAccepted} onChange={setTermsAccepted} />
            </BlockStack>
          </Modal.Section>
        </Modal>
      </DashboardLayout >
    </AppProvider >
  );
}
