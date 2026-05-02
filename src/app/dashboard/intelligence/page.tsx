'use client';

import { useState, useEffect } from 'react';
import { Sparkles, Bot, Mail, ShieldAlert, FileText, CheckCircle, Zap, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { appConfig, mockCandidates } from '@/lib/config';

export default function IntelligencePage() {
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState({
        totalParsed: 0,
        averageScore: 0,
        emailsSent: 0,
        duplicatesFound: 0,
        topSkills: [] as { name: string, count: number }[]
    });

    useEffect(() => {
        // Simulate data loading
        const loadStats = async () => {
            setIsLoading(true);
            await new Promise(resolve => setTimeout(resolve, 800));

            // Generate some stats from mock data
            const candidatesWithSkills = mockCandidates.filter(c => c.skills && c.skills.length > 0);
            
            // Calculate top skills
            const skillCounts: Record<string, number> = {};
            candidatesWithSkills.forEach(c => {
                c.skills?.forEach(s => {
                    skillCounts[s] = (skillCounts[s] || 0) + 1;
                });
            });
            
            const sortedSkills = Object.entries(skillCounts)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([name, count]) => ({ name, count }));

            // Average score
            const scoredCandidates = mockCandidates.filter(c => c.score);
            const avgScore = scoredCandidates.length > 0 
                ? Math.round(scoredCandidates.reduce((sum, c) => sum + (c.score || 0), 0) / scoredCandidates.length)
                : 0;

            setStats({
                totalParsed: mockCandidates.length * 3, // Fake multiplier for volume
                averageScore: avgScore,
                emailsSent: 142, // Fake volume
                duplicatesFound: 12, // Fake volume
                topSkills: sortedSkills
            });

            setIsLoading(false);
        };

        loadStats();
    }, []);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Sparkles className="w-6 h-6 text-purple-600" />
                        Intelligence Center
                    </h1>
                    <p className="text-slate-600">Overview of AI operations and automated workflows</p>
                </div>
                <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 px-3 py-1">
                    <Zap className="w-4 h-4 mr-1" />
                    System Active
                </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-slate-200">
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-slate-500">CVs Auto-Parsed</p>
                                <p className="text-3xl font-bold text-slate-900 mt-2">{stats.totalParsed}</p>
                            </div>
                            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                                <FileText className="w-5 h-5 text-blue-600" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center text-sm text-green-600 font-medium">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            98% accuracy
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-200">
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-slate-500">Auto Emails Sent</p>
                                <p className="text-3xl font-bold text-slate-900 mt-2">{stats.emailsSent}</p>
                            </div>
                            <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                                <Mail className="w-5 h-5 text-indigo-600" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center text-sm text-slate-500">
                            Saved ~4.5 hours of manual work
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-200">
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-slate-500">Avg. AI Match Score</p>
                                <p className="text-3xl font-bold text-slate-900 mt-2">{stats.averageScore}%</p>
                            </div>
                            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                                <Bot className="w-5 h-5 text-purple-600" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center text-sm text-slate-500">
                            Across all active jobs
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-200">
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-slate-500">Duplicates Blocked</p>
                                <p className="text-3xl font-bold text-slate-900 mt-2">{stats.duplicatesFound}</p>
                            </div>
                            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                                <ShieldAlert className="w-5 h-5 text-amber-600" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center text-sm text-slate-500">
                            Keeps pipeline clean
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-slate-200">
                    <CardHeader>
                        <CardTitle>Top Skills Detected</CardTitle>
                        <CardDescription>Most frequent skills found across all candidate CVs</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {stats.topSkills.map((skill, index) => (
                                <div key={index} className="flex items-center">
                                    <div className="w-32 truncate text-sm font-medium text-slate-700 capitalize">
                                        {skill.name}
                                    </div>
                                    <div className="flex-1 ml-4">
                                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-purple-500 rounded-full" 
                                                style={{ width: `${(skill.count / stats.topSkills[0].count) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                    <div className="ml-4 w-8 text-right text-sm text-slate-500 font-medium">
                                        {skill.count}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-200 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <Bot className="w-5 h-5 text-purple-400" />
                            System Status
                        </CardTitle>
                        <CardDescription className="text-slate-400">Current active automation modules</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-white/10 rounded-lg border border-white/10">
                            <div>
                                <p className="font-medium">AI Resume Scoring</p>
                                <p className="text-xs text-slate-400">Keyword matching & analysis</p>
                            </div>
                            <Badge className="bg-green-500/20 text-green-400 border-none">Active</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-white/10 rounded-lg border border-white/10">
                            <div>
                                <p className="font-medium">CV Auto-Parsing</p>
                                <p className="text-xs text-slate-400">PDF text extraction</p>
                            </div>
                            <Badge className="bg-green-500/20 text-green-400 border-none">Active</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-white/10 rounded-lg border border-white/10">
                            <div>
                                <p className="font-medium">Email Automation</p>
                                <p className="text-xs text-slate-400">Status change triggers</p>
                            </div>
                            <Badge className="bg-green-500/20 text-green-400 border-none">Active</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-white/10 rounded-lg border border-white/10">
                            <div>
                                <p className="font-medium">Duplicate Detection</p>
                                <p className="text-xs text-slate-400">Email & job matching</p>
                            </div>
                            <Badge className="bg-green-500/20 text-green-400 border-none">Active</Badge>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
