export type CardLayout = 'bar' | 'classic' | 'centered' | 'header';
export type CardSize = 'us' | 'eu' | 'square';

export interface BusinessCardData {
	name: string;
	title: string;
	company: string;
	email: string;
	phone: string;
	website: string;
	location: string;
	linkedin: string;
	github: string;
	twitter: string;
	layout: CardLayout;
	primaryColor: string;
	textColor: string;
	bgColor: string;
	size: CardSize;
}

export const defaultData: BusinessCardData = {
	name: 'Jane Doe',
	title: 'Software Engineer',
	company: 'Acme Corp',
	email: 'jane@example.com',
	phone: '+1 555 123 4567',
	website: '',
	location: 'San Francisco, CA',
	linkedin: '',
	github: '',
	twitter: '',
	layout: 'bar',
	primaryColor: '22327F',
	textColor: '1b1b1b',
	bgColor: 'ffffff',
	size: 'us'
};
