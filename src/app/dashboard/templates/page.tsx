'use client';

import { useState } from 'react';
import { Mail, Plus, Edit, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { EMAIL_TRIGGERS } from '@/constants/emailTemplates';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function EmailTemplatesPage() {
    const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

    const templates = Object.entries(EMAIL_TRIGGERS).map(([key, value]) => ({
        id: key,
        trigger: key,
        subject: value.subject,
        event: value.event,
        body: value.defaultBody,
    }));

    const selectedTemplateData = selectedTemplate
        ? templates.find(t => t.id === selectedTemplate)
        : null;

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Email Templates</h1>
                    <p className="text-slate-600">Kelola template email otomatis untuk setiap tahap rekrutmen</p>
                </div>
                <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Custom Template
                </Button>
            </div>

            {/* Info Card */}
            <Card className="border-blue-200 bg-blue-50">
                <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                        <Mail className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-blue-900">
                                Email Otomatis Aktif
                            </p>
                            <p className="text-sm text-blue-700 mt-1">
                                Setiap kali status kandidat berubah, email akan dikirim otomatis menggunakan template di bawah ini.
                                Anda dapat melihat preview dan mengedit template sesuai kebutuhan.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Templates Tabs */}
            <Card className="border-slate-200">
                <CardHeader>
                    <CardTitle>Default Templates</CardTitle>
                    <CardDescription>
                        Template email untuk setiap tahap pipeline
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="applied" className="w-full">
                        <TabsList className="grid grid-cols-4 lg:grid-cols-6 mb-6">
                            <TabsTrigger value="applied">Applied</TabsTrigger>
                            <TabsTrigger value="screening">Screening</TabsTrigger>
                            <TabsTrigger value="interview">Interview</TabsTrigger>
                            <TabsTrigger value="test">Test</TabsTrigger>
                            <TabsTrigger value="offering">Offering</TabsTrigger>
                            <TabsTrigger value="hired">Hired</TabsTrigger>
                        </TabsList>

                        {/* Applied */}
                        <TabsContent value="applied">
                            <TemplateCard
                                template={templates.find(t => t.id === 'applied')!}
                                onView={setSelectedTemplate}
                            />
                        </TabsContent>

                        {/* Screening */}
                        <TabsContent value="screening">
                            <div className="space-y-4">
                                <TemplateCard
                                    template={templates.find(t => t.id === 'screening_pass')!}
                                    onView={setSelectedTemplate}
                                    variant="pass"
                                />
                                <TemplateCard
                                    template={templates.find(t => t.id === 'screening_reject')!}
                                    onView={setSelectedTemplate}
                                    variant="reject"
                                />
                            </div>
                        </TabsContent>

                        {/* Interview */}
                        <TabsContent value="interview">
                            <div className="space-y-4">
                                {['interview_1', 'interview_2', 'interview_3'].map(stage => (
                                    <div key={stage}>
                                        <h3 className="text-sm font-semibold text-slate-700 mb-3 capitalize">
                                            {stage.replace('_', ' ')}
                                        </h3>
                                        <div className="space-y-4 ml-4">
                                            <TemplateCard
                                                template={templates.find(t => t.id === `${stage}_pass`)!}
                                                onView={setSelectedTemplate}
                                                variant="pass"
                                            />
                                            <TemplateCard
                                                template={templates.find(t => t.id === `${stage}_reject`)!}
                                                onView={setSelectedTemplate}
                                                variant="reject"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </TabsContent>

                        {/* Test */}
                        <TabsContent value="test">
                            <div className="space-y-4">
                                <TemplateCard
                                    template={templates.find(t => t.id === 'test_pass')!}
                                    onView={setSelectedTemplate}
                                    variant="pass"
                                />
                                <TemplateCard
                                    template={templates.find(t => t.id === 'test_reject')!}
                                    onView={setSelectedTemplate}
                                    variant="reject"
                                />
                            </div>
                        </TabsContent>

                        {/* Offering */}
                        <TabsContent value="offering">
                            <TemplateCard
                                template={templates.find(t => t.id === 'offering')!}
                                onView={setSelectedTemplate}
                            />
                        </TabsContent>

                        {/* Hired */}
                        <TabsContent value="hired">
                            <TemplateCard
                                template={templates.find(t => t.id === 'hired')!}
                                onView={setSelectedTemplate}
                            />
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

            {/* Preview Dialog */}
            <Dialog open={!!selectedTemplate} onOpenChange={() => setSelectedTemplate(null)}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Preview Email Template</DialogTitle>
                        <DialogDescription>
                            {selectedTemplateData?.event}
                        </DialogDescription>
                    </DialogHeader>
                    {selectedTemplateData && (
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-slate-700">Subject</label>
                                <p className="mt-1 text-slate-900 bg-slate-50 p-3 rounded-lg">
                                    {selectedTemplateData.subject}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-700">Body</label>
                                <div className="mt-1 text-slate-900 bg-slate-50 p-4 rounded-lg whitespace-pre-line">
                                    {selectedTemplateData.body}
                                </div>
                            </div>
                            <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                                <p className="text-sm text-blue-800">
                                    <strong>Variables:</strong> {'{'}{'{'} applicant_name {'}'}{'}'},  {'{'}{'{'} job_title {'}'}{'}'},
                                    {'{'}{'{'} company_name {'}'}{'}'},  {'{'}{'{'} tracking_id {'}'}{'}'}, {'{'}{'{'} interview_date {'}'}{'}'}
                                </p>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}

function TemplateCard({
    template,
    onView,
    variant
}: {
    template: { id: string; subject: string; event: string; body: string };
    onView: (id: string) => void;
    variant?: 'pass' | 'reject';
}) {
    return (
        <Card className="border-slate-200">
            <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold text-slate-900">{template.subject}</h4>
                            {variant === 'pass' && (
                                <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Pass</Badge>
                            )}
                            {variant === 'reject' && (
                                <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Reject</Badge>
                            )}
                        </div>
                        <p className="text-sm text-slate-500">{template.event}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onView(template.id)}
                        >
                            <Eye className="w-4 h-4 mr-1" />
                            Preview
                        </Button>
                        <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
