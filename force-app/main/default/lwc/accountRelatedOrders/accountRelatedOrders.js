import { LightningElement, wire } from 'lwc';
import getOrders from '@salesforce/apex/OrderController.getOrders';
import getAccounts from '@salesforce/apex/AccountController.getAccounts';
import getOrderMonths from '@salesforce/apex/AccountController.getOrderMonths';

const columns = [
    { label: 'Order Name', fieldName: 'orderUrl', type: 'url', 
        typeAttributes: { label: { fieldName: 'Name' }, target: '_blank' } },
    { label: 'Total Amount', fieldName: 'Total_Amount__c', type: 'number'  },
    { label: 'Payment Due Date', fieldName: 'Payment_Due_date__c', type: 'date', cellAttributes: { alignment: 'center' } },
    { label: 'Account', fieldName: 'accountUrl', type: 'url', 
        typeAttributes: { label: { fieldName: 'accountName' }, target: '_blank' }}
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
                orderUrl: `/lightning/r/Order__c/${record.Id}/view`,
                accountUrl: `/lightning/r/Order__c/${record.Account__c}/view`,
                accountName: record.Account__r.Name
                
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