'use client';

import { useState, useEffect, useRef } from 'react';
import { Building2, Mail, Palette, Save, Upload, Loader2, Globe, Sparkles, Bot, Key } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { getCompanySettings, updateCompanySettings, type CompanySettings } from '@/lib/actions/settings';
import Image from 'next/image';

export default function SettingsPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Form State
    const [companyId, setCompanyId] = useState<string>('');
    const [companyName, setCompanyName] = useState('');
    const [companyDomain, setCompanyDomain] = useState('');
    const [primaryColor, setPrimaryColor] = useState('#3B82F6');
    const [logoUrl, setLogoUrl] = useState<string | null>(null);

    // Automation State
    const [parsingEngine, setParsingEngine] = useState<'library' | 'ai'>('library');
    const [openaiKey, setOpenaiKey] = useState('');

    // File Upload State
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        async function loadSettings() {
            try {
                const result = await getCompanySettings();
                if (result.success && result.data) {
                    const data = result.data as CompanySettings; // We handle custom field in logic
                    setCompanyId(data.id);
                    setCompanyName(data.name || '');
                    setCompanyDomain(data.domain || '');
                    setPrimaryColor(data.primary_color || '#3B82F6');
                    setLogoUrl(data.logo_url || null);

                    if (data.parsing_config) {
                        setParsingEngine(data.parsing_config.engine || 'library');
                        setOpenaiKey(data.parsing_config.openai_api_key || '');
                    }
                } else {
                    toast.error(result.message || 'Gagal memuat pengaturan');
                }
            } catch (error) {
                console.error(error);
                toast.error('Terjadi kesalahan saat memuat data');
            } finally {
                setIsLoading(false);
            }
        }
        loadSettings();
    }, []);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('bucket', 'cv-files'); // Use existing public bucket for MVP

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Upload failed');
            }

            setLogoUrl(data.file_url);
            toast.success('Logo berhasil diupload!');
        } catch (error) {
            console.error('Upload error:', error);
            toast.error(error instanceof Error ? error.message : 'Gagal mengupload logo');
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleSave = async () => {
        if (!companyName) {
            toast.error('Nama perusahaan tidak boleh kosong');
            return;
        }

        setIsSaving(true);
        try {
            const result = await updateCompanySettings({
                name: companyName,
                domain: companyDomain,
                primary_color: primaryColor,
                logo_url: logoUrl || undefined,
                parsing_config: {
                    engine: parsingEngine,
                    openai_api_key: openaiKey
                }
            });

            if (result.success) {
                toast.success('Pengaturan berhasil disimpan!');
            } else {
                toast.error(result.message || 'Gagal menyimpan pengaturan');
            }
        } catch (error) {
            console.error(error);
            toast.error('Terjadi kesalahan sistem');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-4xl">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Pengaturan</h1>
                <p className="text-slate-600">Kelola identitas dan branding perusahaan</p>
            </div>

            {/* Company Information */}
            <Card className="border-slate-200">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-slate-600" />
                        <CardTitle>Informasi Perusahaan</CardTitle>
                    </div>
                    <CardDescription>
                        Identitas utama yang akan dilihat oleh pelamar
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="company-name">Nama Perusahaan</Label>
                            <Input
                                id="company-name"
                                value={companyName}
                                onChange={(e) => setCompanyName(e.target.value)}
                                placeholder="PT. SmartRecruit Indonesia"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="company-domain">Domain / Website</Label>
                            <div className="relative">
                                <Globe className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                                <Input
                                    id="company-domain"
                                    value={companyDomain}
                                    onChange={(e) => setCompanyDomain(e.target.value)}
                                    placeholder="smartrecruit.com"
                                    className="pl-9"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="company-logo">Logo Perusahaan</Label>
                        <div className="flex items-center gap-4">
                            <div className="w-20 h-20 bg-slate-100 rounded-xl flex items-center justify-center overflow-hidden border border-slate-200 relative">
                                {logoUrl ? (
                                    <Image
                                        src={logoUrl}
                                        alt="Company Logo"
                                        fill
                                        className="object-contain p-2"
                                    />
                                ) : (
                                    <Building2 className="w-10 h-10 text-slate-400" />
                                )}
                            </div>
                            <div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/png, image/jpeg, image/webp"
                                    onChange={handleFileUpload}
                                />
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isUploading}
                                >
                                    {isUploading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Uploading...
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="w-4 h-4 mr-2" />
                                            Upload Logo
                                        </>
                                    )}
                                </Button>
                                <p className="text-xs text-slate-500 mt-1">PNG, JPG atau WebP (Maks 2MB)</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Branding */}
            <Card className="border-slate-200">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Palette className="w-5 h-5 text-slate-600" />
                        <CardTitle>Branding</CardTitle>
                    </div>
                    <CardDescription>
                        Personalisasi warna tema aplikasi
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="primary-color">Warna Utama</Label>
                        <div className="flex items-center gap-4">
                            <Input
                                id="primary-color"
                                type="color"
                                value={primaryColor}
                                onChange={(e) => setPrimaryColor(e.target.value)}
                                className="w-20 h-10 cursor-pointer p-1"
                            />
                            <Input
                                type="text"
                                value={primaryColor}
                                onChange={(e) => setPrimaryColor(e.target.value)}
                                placeholder="#3B82F6"
                                className="flex-1 max-w-xs"
                            />
                            <div
                                className="w-10 h-10 rounded-lg border-2 border-slate-200 shadow-sm"
                                style={{ backgroundColor: primaryColor }}
                            />
                        </div>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                        <p className="text-sm font-medium text-slate-700 mb-3">Live Preview</p>
                        <div className="flex gap-2">
                            <Button
                                style={{
                                    backgroundColor: primaryColor,
                                    borderColor: primaryColor,
                                }}
                                className="text-white hover:opacity-90 transition-opacity"
                            >
                                Primary Button
                            </Button>
                            <Button variant="outline">Secondary Button</Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Automation & AI Settings */}
            <Card className="border-slate-200">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-purple-600" />
                        <CardTitle>Automation & Intelligence</CardTitle>
                    </div>
                    <CardDescription>
                        Konfigurasi cara sistem memproses data pelamar secara otomatis
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                            <div>
                                <p className="font-medium text-slate-900">Parsing Engine</p>
                                <p className="text-sm text-slate-500">Pilih teknologi yang digunakan untuk membaca CV</p>
                            </div>
                            <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-slate-200">
                                <Button
                                    size="sm"
                                    variant={parsingEngine === 'library' ? 'default' : 'ghost'}
                                    onClick={() => setParsingEngine('library')}
                                    className={parsingEngine === 'library' ? 'bg-slate-900 text-white' : ''}
                                >
                                    <Bot className="w-4 h-4 mr-2" />
                                    Library (Free)
                                </Button>
                                <Button
                                    size="sm"
                                    variant={parsingEngine === 'ai' ? 'default' : 'ghost'}
                                    onClick={() => setParsingEngine('ai')}
                                    className={parsingEngine === 'ai' ? 'bg-purple-600 text-white hover:bg-purple-700' : ''}
                                >
                                    <Sparkles className="w-4 h-4 mr-2" />
                                    AI (OpenAI)
                                </Button>
                            </div>
                        </div>

                        {parsingEngine === 'ai' && (
                            <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                <Label htmlFor="openai-key">OpenAI API Key</Label>
                                <div className="relative">
                                    <Key className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                                    <Input
                                        id="openai-key"
                                        type="password"
                                        value={openaiKey}
                                        onChange={(e) => setOpenaiKey(e.target.value)}
                                        placeholder="sk-..."
                                        className="pl-9"
                                    />
                                </div>
                                <p className="text-xs text-slate-500">
                                    Key Anda akan disimpan secara aman. Kami menggunakan model GPT-4o-mini untuk efisiensi biaya.
                                </p>
                            </div>
                        )}

                        {parsingEngine === 'library' && (
                            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg flex gap-3">
                                <Bot className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-blue-900">Mode Library Aktif</p>
                                    <p className="text-sm text-blue-700 mt-1">
                                        Sistem akan menggunakan algoritma Regex dan Keyword Matching canggih untuk mengekstrak data.
                                        Gratis, cepat, dan bekerja offline.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Email Configuration (Info Only) */}
            <Card className="border-slate-200 opacity-75">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Mail className="w-5 h-5 text-slate-600" />
                        <CardTitle>Konfigurasi Email</CardTitle>
                    </div>
                    <CardDescription>
                        Email otomatis dikelola oleh Resend API (Mode Developer)
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                        <p className="text-sm text-blue-800">
                            <strong>Status:</strong> Active (Resend API)
                        </p>
                        <p className="text-xs text-blue-600 mt-1">
                            Untuk mengubah pengirim email, silakan hubungi administrator sistem.
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 fixed bottom-0 left-0 w-full bg-white p-4 lg:static lg:bg-transparent lg:p-0 z-10 shadow-lg lg:shadow-none">
                <Button variant="ghost" onClick={() => window.location.reload()}>Reset</Button>
                <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    style={{ backgroundColor: primaryColor }}
                    className="text-white hover:opacity-90 min-w-[150px]"
                >
                    {isSaving ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Menyimpan...
                        </>
                    ) : (
                        <>
                            <Save className="w-4 h-4 mr-2" />
                            Simpan Perubahan
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}
