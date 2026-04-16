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
	name: '',
	title: '',
	company: '',
	email: '',
	phone: '',
	website: '',
	location: '',
	linkedin: '',
	github: '',
	twitter: '',
	layout: 'bar',
	primaryColor: '22327F',
	textColor: '1b1b1b',
	bgColor: 'ffffff',
	size: 'us'
};
