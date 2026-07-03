'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { FileText, Calendar, Users, BarChart3, Settings, Mic2, Gavel } from 'lucide-react';
import { trackEvent } from '../../utils/analytics';

export default function LandingPage() {
  useEffect(() => {
    trackEvent('tm_landing_page_viewed');
  }, []);

  const tools = [
    {
      id: 'minutes-generator',
      title: 'Meeting Minutes Generator',
      description: 'Upload your agenda and generate professional meeting minutes with AI assistance',
      icon: <FileText className="w-8 h-8" />,
      status: 'available',
      href: 'https://ananthlabs.com/toastmasters/tools/minutesgenerator'
    },
    {
      id: 'agenda-creator',
      title: 'Agenda Creator',
      description: 'Create professional meeting agendas with templates and role assignments',
      icon: <Calendar className="w-8 h-8" />,
      status: 'available',
      href: 'https://ananthlabs.com/toastmasters/tools/agendacreator'
    },
    {
      id: 'PR-tracker',
      title: 'PR Creator',
      description: 'Create PR flyers adhering to TI guidelines in a jiffy',
      icon: <Users className="w-8 h-8" />,
      status: 'coming-soon'
    },
    {
      id: 'virtual-chief-judge',
      title: 'Virtual Chief Judge',
      description: 'Automate ballot counting and streamline contest judging seamlessly',
      icon: <Gavel className="w-8 h-8" />,
      status: 'coming-soon'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Mic2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Toastmasters AI Assistant</h1>
                <p className="text-sm text-gray-600">Professional Meeting Management Tools</p>
              </div>
            </div>
            
            <button className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
              <Settings size={16} />
              <span className="text-sm">Settings</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Streamline Your Toastmasters Club
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Professional AI-powered tools to help you manage meetings, create agendas, 
            generate minutes, and track member progress with ease.
          </p>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 mb-16">
          {tools.map((tool) => {
            const CardWrapper = tool.status === 'available' ? Link : 'div';
            
            return (
            <CardWrapper
              key={tool.id}
              href={tool.href}
              onClick={() => trackEvent('tm_tool_clicked', { tool_id: tool.id })}
              className={`
                relative bg-white rounded-xl shadow-sm border-2 p-8 transition-all duration-300 block
                ${tool.status === 'available' 
                  ? 'border-gray-200 hover:border-blue-500 hover:shadow-lg cursor-pointer transform hover:-translate-y-1' 
                  : 'border-gray-100 opacity-60 cursor-not-allowed'
                }
              `}
            >
              {/* Status Badge */}
              {tool.status === 'coming-soon' && (
                <div className="absolute top-4 right-4 px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                  Coming Soon
                </div>
              )}

              {/* Tool Icon */}
              <div className={`
                w-16 h-16 rounded-lg flex items-center justify-center mb-6
                ${tool.status === 'available' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}
              `}>
                {tool.icon}
              </div>

              {/* Tool Content */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {tool.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {tool.description}
                </p>
              </div>

              {/* Action Indicator */}
              {tool.status === 'available' && (
                <div className="mt-6 flex items-center text-blue-600 font-medium">
                  <span>Get Started</span>
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              )}
            </CardWrapper>
          )})}
        </div>

        {/* Features Section */}
        <div className="bg-white rounded-xl shadow-sm border p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Why Choose Our AI Assistant?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <FileText className="w-6 h-6" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">AI-Powered</h4>
              <p className="text-gray-600 text-sm">
                Advanced AI technology to automate and enhance your meeting management
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Club-Focused</h4>
              <p className="text-gray-600 text-sm">
                Designed specifically for Toastmasters clubs and meeting formats
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Professional</h4>
              <p className="text-gray-600 text-sm">
                Generate professional-quality documents and reports effortlessly
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="text-center text-gray-600">
            <p className="mb-2">Built for Toastmasters International clubs worldwide</p>
            <p className="text-sm">Empowering clubs with AI-powered meeting management tools</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
