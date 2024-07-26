import { LightningElement, wire } from 'lwc';
import getOrders from '@salesforce/apex/OrderController.getOrders';
import getAccounts from '@salesforce/apex/AccountController.getAccounts';
import getOrderMonths from '@salesforce/apex/AccountController.getOrderMonths';
import ORDER_NAME from '@salesforce/schema/Order__c.Name';
import ORDER_TOTAL_AMOUNT from '@salesforce/schema/Order__c.Total_Amount__c';
import ORDER_PAYMENT_DUE_DATE from '@salesforce/schema/Order__c.Payment_Due_Date__c';
import ORDER_ACCOUNT from '@salesforce/schema/Order__c.Account__c';

const columns = [
    { label: 'Order Name', fieldName: 'orderUrl', type: 'url', 
      typeAttributes: { label: { fieldName: ORDER_NAME.fieldApiName }, target: '_self' } },
    { label: 'Total Amount', fieldName: ORDER_TOTAL_AMOUNT.fieldApiName, type: 'number' },
    { label: 'Payment Due Date', fieldName: ORDER_PAYMENT_DUE_DATE.fieldApiName, type: 'date' },
    { label: 'Account', fieldName: ORDER_ACCOUNT.fieldApiName, type: 'text' }
];

const allMonths = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];


export default class AccountRelatedOrders extends LightningElement {
    error;
    orderData;
    accounts = [];
    selectedAccount;
    selectedMonth;
    months = [];
    value;

    //accounts
    @wire(getAccounts)
    wiredAccounts({ error, data }) {
        if (data) {
            this.accounts = data.map(account => {
                return { value: account.Id, label: account.Name };
            });
            this.error = undefined;
        } else if (error) {
            this.error = error;
            this.accounts = [];
        }
    }


    handleAccountChange(event) {
        this.selectedAccount = event.detail.value;
        this.selectedMonth = '';
    }

    //month
    @wire(getOrderMonths, { accountId: '$selectedAccount' })
    wiredMonths({ error, data }) {
        if (data) {
            this.months = data.map(month => {
                return { value: month, label: allMonths[month - 1]  };
            });
            this.error = undefined;
        } else if (error) {
            this.error = error;
            this.months = [];
        }
    }
    

    handleMonthChange(event) {
        this.selectedMonth = +event.detail.value;
        console.log(this.selectedMonth);
    }

    //Records
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

    get filteredOrderData() {
        return this.orderData.filter(order => {
            console.log(order.Payment_Due_date__c.slice(5,7));
            return (order.Account__c == this.selectedAccount && +order.Payment_Due_date__c.slice(5,7) == this.selectedMonth);
        });
        
    }
}