import { ChartConfiguration, ChartData, ChartOptions } from 'chart.js';
import React, { FC, useEffect, useRef } from 'react';
import { Bar } from 'react-chartjs-2';
import socket from '../../Services/SocketService';
import Colours from '../../Styles/Colours';
import { CardTitle } from '../../Styles/Containers';
import { SensorData } from '../../Types/SensorData';
import * as Styles from './SensorFeed.styles';

const AngerData = {
	labels: ['Anger'],
	datasets: [
		{
			label: 'Sensor value',
			borderWidth: 2,
			fill: true,
			data: [null],
			backgroundColor: [Colours.temperatureLight],
			borderColor: [Colours.temperature],
		},
	],
};

const FearData = {
	labels: ['Fear'],
	datasets: [
		{
			label: 'Sensor value',
			borderWidth: 2,
			fill: true,
			data: [null],
			backgroundColor: [Colours.pressureLight],
			borderColor: [Colours.pressure],
		},
	],
};

const JoyData = {
	labels: ['Joy'],
	datasets: [
		{
			label: 'Sensor value',
			borderWidth: 2,
			fill: true,
			data: [null],
			backgroundColor: [Colours.humidityLight],
			borderColor: [Colours.humidity],
		},
	],
};

const SadnessData = {
	labels: ['Sadness'],
	datasets: [
		{
			label: 'Sensor value',
			borderWidth: 2,
			fill: true,
			data: [null],
			backgroundColor: [Colours.lightLight],
			borderColor: [Colours.light],
		},
	],
};

const AnalyticalData = {
	labels: ['Analytical'],
	datasets: [
		{
			label: 'Sensor value',
			borderWidth: 2,
			fill: true,
			data: [null],
			backgroundColor: [Colours.oxidisedLight],
			borderColor: [Colours.oxidised],
		},
	],
};

const ConfidentData = {
	labels: ['Confident'],
	datasets: [
		{
			label: 'Sensor value',
			borderWidth: 2,
			fill: true,
			data: [null],
			backgroundColor: [Colours.reducedLight],
			borderColor: [Colours.reduced],
		},
	],
};

const TentativeData = {
	labels: ['Tentative'],
	datasets: [
		{
			label: 'Sensor value',
			borderWidth: 2,
			fill: true,
			data: [null],
			backgroundColor: [Colours.nh3Light],
			borderColor: [Colours.nh3],
		},
	],
};

const chartOptions = {
	responsive: true,
	maintainAspectRatio: false,
	plugins: {
		legend: {
			display: false,
		},
	},
};

const angerOptions = {
	...chartOptions,
	scales: {
		yAxes: {
			suggestedMax: 40,
			suggestedMin: 0,
		},
	},
};

const fearOptions = {
	...chartOptions,
	scales: {
		yAxes: {
			suggestedMax: 1200,
			suggestedMin: 0,
		},
	},
};

const joyOptions = {
	...chartOptions,
	scales: {
		yAxes: {
			suggestedMax: 30,
			suggestedMin: 0,
		},
	},
};

const sadOptions = {
	...chartOptions,
	scales: {
		yAxes: {
			suggestedMax: 500,
			suggestedMin: 0,
		},
	},
};

const analyticalOptions = {
	...chartOptions,
	scales: {
		yAxes: {
			suggestedMax: 15,
			suggestedMin: 0,
		},
	},
};

const confidentOptions = {
	...chartOptions,
	scales: {
		yAxes: {
			suggestedMax: 400,
			suggestedMin: 0,
		},
	},
};

const tentativeOptions = {
	...chartOptions,
	scales: {
		yAxes: {
			suggestedMax: 300,
			suggestedMin: 0,
		},
	},
};

const SentimentFeed = () => {
	// Chart references
	const anger = useRef<ChartConfiguration | any>(null);
	const fear = useRef<ChartConfiguration | any>(null);
	const joy = useRef<ChartConfiguration | any>(null);
	const sadness = useRef<ChartConfiguration | any>(null);
	const analytical = useRef<ChartConfiguration | any>(null);
	const confident = useRef<ChartConfiguration | any>(null);
	const tentative = useRef<ChartConfiguration | any>(null);

	// Subscribe to socket
	useEffect(() => {
		socket.on('sensor', (data) => {
			if (tempRef.current) {
				tempRef.current.data.datasets[0].data = [data.temperature];
				tempRef.current.update();
			}
			if (preRef.current) {
				preRef.current.data.datasets[0].data = [data.pressure];
				preRef.current.update();
			}
			if (humRef.current) {
				humRef.current.data.datasets[0].data = [data.humidity];
				humRef.current.update();
			}
			if (lightRef.current) {
				lightRef.current.data.datasets[0].data = [data.light];
				lightRef.current.update();
			}
			if (oxRef.current) {
				oxRef.current.data.datasets[0].data = [data.oxidised];
				oxRef.current.update();
			}
			if (reRef.current) {
				reRef.current.data.datasets[0].data = [data.reduced];
				reRef.current.update();
			}
			if (nh3Ref.current) {
				nh3Ref.current.data.datasets[0].data = [data.nh3];
				nh3Ref.current.update();
			}
		});
	}, []);

	return (
		<Styles.Container>
			<CardTitle>Sensor Feed</CardTitle>
			<Styles.ChartContainer>
				<Styles.ChartCell>
					<Bar ref={tempRef} data={tempData} options={tempOptions} />
				</Styles.ChartCell>
				<Styles.ChartCell>
					<Bar ref={preRef} data={preData} options={preOptions} />
				</Styles.ChartCell>
				<Styles.ChartCell>
					<Bar ref={humRef} data={humData} options={humOptions} />
				</Styles.ChartCell>
				<Styles.ChartCell>
					<Bar ref={lightRef} data={lightData} options={lightOptions} />
				</Styles.ChartCell>
				<Styles.ChartCell>
					<Bar ref={oxRef} data={oxData} options={oxOptions} />
				</Styles.ChartCell>
				<Styles.ChartCell>
					<Bar ref={reRef} data={reData} options={reOptions} />
				</Styles.ChartCell>
				<Styles.ChartCell>
					<Bar ref={nh3Ref} data={nh3Data} options={nh3Options} />
				</Styles.ChartCell>
			</Styles.ChartContainer>
		</Styles.Container>
	);
};

export default SentimentFeed;