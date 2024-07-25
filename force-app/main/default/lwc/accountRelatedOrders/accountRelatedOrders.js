import { LightningElement, wire } from 'lwc';
import getOrders from '@salesforce/apex/OrderController.getOrders';
import ORDER_NAME from '@salesforce/schema/Order__c.Name';
import ORDER_TOTAL_AMOUNT from '@salesforce/schema/Order__c.Total_Amount__c';
import ORDER_PAYMENT_DUE_DATE from '@salesforce/schema/Order__c.Payment_Due_Date__c';
import ORDER_ACCOUNT from '@salesforce/schema/Order__c.Account__c';

const columns = [
    { label: 'Order Name', fieldName: 'orderUrl', type: 'url', 
      typeAttributes: { label: { fieldName: ORDER_NAME.fieldApiName }, target: '_self' } },
    { label: 'Total Amount', fieldName: ORDER_TOTAL_AMOUNT.fieldApiName, type: 'currency' },
    { label: 'Payment Due Date', fieldName: ORDER_PAYMENT_DUE_DATE.fieldApiName, type: 'date' },
    { label: 'Account', fieldName: ORDER_ACCOUNT.fieldApiName, type: 'text' }
];

export default class AccountRelatedOrders extends LightningElement {
    error;
    orderData;

    accountOptions = [
        { value: 'new', label: 'New', description: 'A new item' },
        {
            value: 'in-progress',
            label: 'In Progress',
            description: 'Currently working on this item',
        },
        {
            value: 'finished',
            label: 'Finished',
            description: 'Done working on this item',
        },
    ];

    accountValue = 'new';

    handleAccountChange(event) {
        // Get the string of the "value" attribute on the selected option
        this.accountValue = event.detail.value;
    }

    orderMonthOptions = [
        { value: 'new', label: 'New', description: 'A new item' },
        {
            value: 'in-progress',
            label: 'In Progress',
            description: 'Currently working on this item',
        },
        {
            value: 'finished',
            label: 'Finished',
            description: 'Done working on this item',
        },
    ];

    orderMonthValue = 'new';

    handleMonthChange(event) {
        this.orderMonthValue = event.detail.value;
    }

    orderColumns = columns;

    @wire(getOrders)
    wiredOrders({ error, data }) {
        if (data) {
            this.orderData = data.map(record => ({
                ...record,
                orderUrl: `/lightning/r/Order__c/${record.Id}/view`
            }));
            this.error = undefined;
        } else if (error) {
            this.error = error;
            this.orderData = undefined;
        }
    }
}