'use client';

import React, { useState } from 'react';
import { MultiColumnLayout, EmailLayout, DashboardLayout, ProjectManagementLayout } from './ui/MultiColumnLayout';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Avatar } from './ui/Avatar';
import { Card } from './ui/Card';
import { DataTable } from './ui/DataTable';
import { 
  HomeIcon,
  UsersIcon,
  FolderIcon,
  CalendarIcon,
  DocumentDuplicateIcon,
  ChartPieIcon,
  InboxIcon,
  PaperAirplaneIcon,
  ArchiveBoxIcon,
  TrashIcon,
  StarIcon,
  ChatBubbleLeftIcon,
  BellIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';

// Données d'exemple
const navigation = [
  { name: 'Dashboard', href: '#', icon: HomeIcon, current: true },
  { name: 'Équipe', href: '#', icon: UsersIcon, current: false },
  { name: 'Projets', href: '#', icon: FolderIcon, current: false },
  { name: 'Calendrier', href: '#', icon: CalendarIcon, current: false },
  { name: 'Documents', href: '#', icon: DocumentDuplicateIcon, current: false },
  { name: 'Rapports', href: '#', icon: ChartPieIcon, current: false },
];

const emailNavigation = [
  { name: 'Boîte de réception', href: '#', icon: InboxIcon, current: true },
  { name: 'Envoyés', href: '#', icon: PaperAirplaneIcon, current: false },
  { name: 'Favoris', href: '#', icon: StarIcon, current: false },
  { name: 'Archives', href: '#', icon: ArchiveBoxIcon, current: false },
  { name: 'Corbeille', href: '#', icon: TrashIcon, current: false },
];

const teams = [
  { id: 1, name: 'Heroicons', href: '#', initial: 'H', current: false },
  { id: 2, name: 'Tailwind Labs', href: '#', initial: 'T', current: false },
  { id: 3, name: 'Workcation', href: '#', initial: 'W', current: false },
];

const user = {
  name: 'Tom Cook',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  onClick: () => console.log('Profile clicked')
};

const emails = [
  {
    id: 1,
    sender: 'Leslie Alexander',
    subject: 'Nouveau design system disponible',
    preview: 'Salut ! Je voulais te faire savoir que le nouveau design system est maintenant disponible...',
    time: '1h',
    unread: true,
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
  },
  {
    id: 2,
    sender: 'Michael Foster',
    subject: 'Réunion équipe demain',
    preview: 'N\'oublie pas notre réunion d\'équipe prévue demain à 14h. On va discuter du nouveau projet...',
    time: '3h',
    unread: true,
    avatar: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
  },
  {
    id: 3,
    sender: 'Dries Vincent',
    subject: 'Feedback sur le prototype',
    preview: 'J\'ai testé le prototype et j\'ai quelques suggestions d\'amélioration...',
    time: '1j',
    unread: false,
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
  }
];

const projects = [
  { id: 1, name: 'Site web corporate', status: 'En cours', progress: 75, team: 'Design' },
  { id: 2, name: 'App mobile', status: 'En attente', progress: 30, team: 'Dev' },
  { id: 3, name: 'Refonte UX', status: 'Terminé', progress: 100, team: 'UX' }
];

export function MultiColumnExample() {
  const [currentLayout, setCurrentLayout] = useState<'email' | 'dashboard' | 'project'>('email');

  const renderEmailLayout = () => (
    <EmailLayout
      navigation={emailNavigation}
      teams={teams}
      user={user}
      title="Messagerie"
      logo="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600"
      secondaryColumn={
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Boîte de réception</h3>
          <div className="space-y-2">
            {emails.map((email) => (
              <div
                key={email.id}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  email.unread 
                    ? 'bg-blue-50 border-l-4 border-blue-500 dark:bg-blue-900/20' 
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <Avatar src={email.avatar} name={email.sender} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className={`text-sm font-medium ${email.unread ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300'}`}>
                        {email.sender}
                      </p>
                      <span className="text-xs text-gray-500">{email.time}</span>
                    </div>
                    <p className={`text-sm ${email.unread ? 'font-medium text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                      {email.subject}
                    </p>
                    <p className="text-xs text-gray-500 truncate mt-1">
                      {email.preview}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="border-b border-gray-200 pb-4 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Nouveau design system disponible</h1>
              <div className="flex items-center space-x-4 mt-2">
                <div className="flex items-center space-x-2">
                  <Avatar src={emails[0].avatar} name={emails[0].sender} size="sm" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">{emails[0].sender}</span>
                </div>
                <span className="text-sm text-gray-500">il y a 1 heure</span>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <ArchiveBoxIcon className="w-4 h-4 mr-2" />
                Archiver
              </Button>
              <Button variant="outline" size="sm">
                <TrashIcon className="w-4 h-4 mr-2" />
                Supprimer
              </Button>
            </div>
          </div>
        </div>
        
        <div className="prose max-w-none dark:prose-invert">
          <p>Salut !</p>
          <p>Je voulais te faire savoir que le nouveau design system est maintenant disponible. Nous avons travaillé dur ces dernières semaines pour créer quelque chose de vraiment spécial.</p>
          <p>Voici les principales nouveautés :</p>
          <ul>
            <li>Nouveaux composants UI avec Tailwind CSS</li>
            <li>Support complet du mode sombre</li>
            <li>Composants accessibles avec Headless UI</li>
            <li>Documentation complète avec exemples</li>
          </ul>
          <p>N'hésite pas à me faire savoir ce que tu en penses !</p>
          <p>Cordialement,<br />Leslie</p>
        </div>

        <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
          <Button>
            <PaperAirplaneIcon className="w-4 h-4 mr-2" />
            Répondre
          </Button>
        </div>
      </div>
    </EmailLayout>
  );

  const renderDashboardLayout = () => (
    <DashboardLayout
      navigation={navigation}
      teams={teams}
      user={user}
      title="Dashboard"
      logo="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600"
      secondaryColumn={
        <div className="space-y-6">
          <Card title="Activité récente">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Projet terminé</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Nouveau membre ajouté</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Réunion programmée</span>
              </div>
            </div>
          </Card>

          <Card title="Notifications">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <BellIcon className="w-4 h-4 text-blue-500" />
                <span className="text-sm">3 nouvelles notifications</span>
              </div>
              <div className="flex items-center space-x-2">
                <ChatBubbleLeftIcon className="w-4 h-4 text-green-500" />
                <span className="text-sm">2 nouveaux messages</span>
              </div>
            </div>
          </Card>
        </div>
      }
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Vue d'ensemble de vos projets et activités</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">12</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Projets actifs</div>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">8</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Terminés ce mois</div>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">24</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Membres d'équipe</div>
            </div>
          </Card>
        </div>

        <DataTable
          data={projects}
          columns={[
            { key: 'name', header: 'Projet' },
            { 
              key: 'status', 
              header: 'Statut',
              render: (value: string) => (
                <Badge variant={value === 'Terminé' ? 'success' : value === 'En cours' ? 'info' : 'warning'}>
                  {value}
                </Badge>
              )
            },
            { 
              key: 'progress', 
              header: 'Progression',
              render: (value: number) => (
                <div className="flex items-center space-x-2">
                  <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${value}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">{value}%</span>
                </div>
              )
            },
            { key: 'team', header: 'Équipe' }
          ]}
          title="Projets en cours"
        />
      </div>
    </DashboardLayout>
  );

  const renderProjectLayout = () => (
    <ProjectManagementLayout
      navigation={navigation}
      user={user}
      title="Gestion de projet"
      logo="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600"
      secondaryColumn={
        <div className="space-y-6">
          <Card title="Équipe du projet">
            <div className="space-y-3">
              {['Alice Johnson', 'Bob Smith', 'Carol Davis'].map((name, index) => (
                <div key={name} className="flex items-center space-x-3">
                  <Avatar 
                    name={name} 
                    size="sm"
                    src={`https://images.unsplash.com/photo-${1472099645785 + index}?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80`}
                  />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{name}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Fichiers récents">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <DocumentDuplicateIcon className="w-4 h-4 text-gray-400" />
                <span className="text-sm">design-system.figma</span>
              </div>
              <div className="flex items-center space-x-2">
                <DocumentDuplicateIcon className="w-4 h-4 text-gray-400" />
                <span className="text-sm">wireframes.pdf</span>
              </div>
            </div>
          </Card>
        </div>
      }
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Site web corporate</h1>
          <p className="text-gray-600 dark:text-gray-400">Refonte complète du site web de l'entreprise</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="Tâches à faire">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <input type="checkbox" className="rounded" />
                <span className="text-sm">Finaliser les maquettes</span>
              </div>
              <div className="flex items-center space-x-3">
                <input type="checkbox" className="rounded" />
                <span className="text-sm">Développer la page d'accueil</span>
              </div>
              <div className="flex items-center space-x-3">
                <input type="checkbox" className="rounded" defaultChecked />
                <span className="text-sm line-through text-gray-500">Créer le design system</span>
              </div>
            </div>
          </Card>

          <Card title="Progression">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Design</span>
                  <span>90%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '90%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Développement</span>
                  <span>60%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '60%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Tests</span>
                  <span>30%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                  <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '30%' }}></div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </ProjectManagementLayout>
  );

  return (
    <div>
      {/* Layout selector */}
      <div className="fixed top-4 right-4 z-50 bg-white rounded-lg shadow-lg p-4 dark:bg-gray-800">
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant={currentLayout === 'email' ? 'default' : 'outline'}
            onClick={() => setCurrentLayout('email')}
          >
            Email
          </Button>
          <Button
            size="sm"
            variant={currentLayout === 'dashboard' ? 'default' : 'outline'}
            onClick={() => setCurrentLayout('dashboard')}
          >
            Dashboard
          </Button>
          <Button
            size="sm"
            variant={currentLayout === 'project' ? 'default' : 'outline'}
            onClick={() => setCurrentLayout('project')}
          >
            Projet
          </Button>
        </div>
      </div>

      {/* Render current layout */}
      {currentLayout === 'email' && renderEmailLayout()}
      {currentLayout === 'dashboard' && renderDashboardLayout()}
      {currentLayout === 'project' && renderProjectLayout()}
    </div>
  );
}